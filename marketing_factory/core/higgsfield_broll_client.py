import hashlib
import json
import os
import re
import time
from typing import Any, Dict, Optional

import requests


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_CACHE_DIR = os.path.join(PROJECT_DIR, "marketing_factory", "output", "broll_cache")
DEFAULT_CATALOG_PATH = os.path.join(PROJECT_DIR, "marketing_factory", "data", "broll_catalog.json")


class HiggsfieldBrollClient:
    """
    Higgsfield MCP / API 기반 저비용 720p B-roll 수급 클라이언트.
    - 해상도 강제 고정: 720p (1080p 대비 약 50%+ 크레딧 절감)
    - 제품 외형 보호 가드: 실제 용기/라벨/로고 AI 생성을 원천 차단하고 공식 레퍼런스 자산만 허용
    - SHA-256 디스크 캐싱 및 오프라인/키 미설정 시 로컬 검증 클립 폴백 지원
    """

    LOCKED_RESOLUTION = "720p"
    DEFAULT_MODEL = "kling-3.0-720p"

    # 모델별 5초 720p 기준 크레딧 가정치 (환경변수나 요금제 변경 시 파라미터로 재정의 가능)
    MODEL_PROFILES: Dict[str, Dict[str, Any]] = {
        "kling-3.0-720p": {
            "provider": "kling",
            "version": "3.0",
            "resolution": "720p",
            "credits_per_5s": 20,
            "credits_per_5s_1080p": 45,
            "usd_per_credit": 0.0045,  # 약 $0.09 / 5초 720p 컷 (Pro 티어 가정치)
            "best_for": "반려견 행동·표정 및 보호자 손동작 자연스러운 모션",
        },
        "seedance-2.5-720p": {
            "provider": "seedance",
            "version": "2.5",
            "resolution": "720p",
            "credits_per_5s": 15,
            "credits_per_5s_1080p": 35,
            "usd_per_credit": 0.0045,  # 약 $0.0675 / 5초 720p 컷
            "best_for": "야간 실내·감정선·배경 무드 컷 초저비용 대량 생성",
        },
    }

    BLOCKED_SCENE_ROLES = {
        "official_reference_asset",
        "product_feeding_cut",
        "product_bottle",
        "product_label",
        "product_hero",
    }

    # 제품 용기·라벨 왜곡을 유발할 수 있는 AI 프롬프트 금지 키워드
    PRODUCT_PROMPT_PATTERNS = [
        r"\bbottle\b",
        r"\blabel\b",
        r"\bpackaging\b",
        r"\blogo\b",
        r"\bproduct\b",
        r"용기",
        r"라벨",
        r"패키지",
        r"제품\s*사진",
        r"제품\s*병",
        r"로고",
        r"파보겔",
        r"parvogel",
        r"pavogel",
        r"몬스멕타",
        r"monsmecta",
        r"헤파맥스",
        r"hepamax",
        r"레날디톡스",
        r"renaldetox",
        r"하트케어",
        r"heartcare",
        r"로타겔",
        r"rotagel",
    ]

    def __init__(
        self,
        cache_dir: Optional[str] = None,
        project_dir: Optional[str] = None,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        base_url: Optional[str] = None,
        max_new_generations_per_run: Optional[int] = None,
    ):
        self.project_dir = project_dir or PROJECT_DIR
        self.cache_dir = cache_dir or DEFAULT_CACHE_DIR
        os.makedirs(self.cache_dir, exist_ok=True)

        self.api_key = (api_key or os.environ.get("HIGGSFIELD_API_KEY", "")).strip()
        self.api_secret = (api_secret or os.environ.get("HIGGSFIELD_API_SECRET", "")).strip()
        self.base_url = (base_url or os.environ.get("HIGGSFIELD_BASE_URL", "https://platform.higgsfield.ai")).rstrip("/")
        self.generate_endpoint = os.environ.get("HIGGSFIELD_GENERATE_PATH", "/v1/video/generations")
        self.default_model = os.environ.get("HIGGSFIELD_DEFAULT_MODEL", self.DEFAULT_MODEL).strip() or self.DEFAULT_MODEL

        # 권장안 3 (720p + 캐시 재사용 50% 모드) 기본 적용: 편당 신규 AI 생성 상한 (기본 1컷)
        if max_new_generations_per_run is None:
            env_cap = os.environ.get("HIGGSFIELD_MAX_NEW_BROLL_PER_RUN", "1").strip()
            self.max_new_generations_per_run = int(env_cap) if env_cap.isdigit() else 1
        else:
            self.max_new_generations_per_run = max(0, int(max_new_generations_per_run))
        self.cache_policy = os.environ.get("HIGGSFIELD_CACHE_POLICY", "option3_cache_50").strip() or "option3_cache_50"
        self._new_generations_this_run = 0

    @classmethod
    def enforce_720p(cls, resolution: Optional[str] = None) -> str:
        """
        모든 B-roll 생성 요청을 720p로 강제 고정합니다.
        1080p/4K 등이 들어와도 비용 최적화를 위해 720p로 클램프합니다.
        """
        _ = resolution
        return cls.LOCKED_RESOLUTION

    @classmethod
    def resolve_model(cls, model: Optional[str] = None) -> str:
        candidate = (model or cls.DEFAULT_MODEL).strip()
        if candidate in cls.MODEL_PROFILES:
            return candidate
        if "seedance" in candidate.lower():
            return "seedance-2.5-720p"
        return cls.DEFAULT_MODEL

    @classmethod
    def assert_no_product_distortion(cls, scene_role: str, prompt_text: str) -> None:
        """
        실제 파보겔·몬스멕타 제품 용기 및 라벨 왜곡 방지를 위해
        제품 노출 역할이나 용기/브랜드명 생성 프롬프트는 즉시 차단합니다.
        """
        role_norm = (scene_role or "").strip().lower()
        if role_norm in cls.BLOCKED_SCENE_ROLES:
            raise ValueError(
                f"[PRODUCT GUARD] scene_role '{scene_role}' must use official high-res reference compositing, not AI B-roll."
            )

        lower_prompt = (prompt_text or "").lower()
        for pattern in cls.PRODUCT_PROMPT_PATTERNS:
            if re.search(pattern, lower_prompt, flags=re.IGNORECASE):
                raise ValueError(
                    f"[PRODUCT GUARD] AI B-roll prompt matched forbidden product/bottle token '{pattern}'. "
                    "AI B-roll is strictly restricted to dog/situation/owner-hand cuts."
                )

    def check_auth_status(self) -> Dict[str, Any]:
        """Higgsfield API 키 설정 및 모델 라우팅 상태를 점검합니다 (외부 비밀값 노출 없음)."""
        has_key = bool(self.api_key)
        has_secret = bool(self.api_secret)
        return {
            "authenticated": has_key,
            "mode": "live_api" if has_key else "local_cache_and_catalog_fallback",
            "api_key_configured": has_key,
            "api_secret_configured": has_secret,
            "base_url": self.base_url,
            "locked_resolution": self.LOCKED_RESOLUTION,
            "default_model": self.resolve_model(self.default_model),
            "cache_policy": self.cache_policy,
            "max_new_generations_per_run": self.max_new_generations_per_run,
            "supported_models": list(self.MODEL_PROFILES.keys()),
            "cache_dir": self.cache_dir,
        }

    def _compute_cache_key(self, model: str, resolution: str, duration_sec: int, prompt: str) -> str:
        payload = f"{model}|{resolution}|{duration_sec}|{(prompt or '').strip()}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]

    def _find_reusable_role_cache(self, scene_role: str) -> Optional[str]:
        """동일 scene_role로 과거에 720p 생성·캐싱된 MP4가 있으면 크레딧 0원으로 재사용합니다."""
        if not os.path.isdir(self.cache_dir):
            return None
        role_norm = (scene_role or "").strip().lower()
        try:
            for fname in sorted(os.listdir(self.cache_dir), reverse=True):
                if not fname.endswith(".json"):
                    continue
                meta_path = os.path.join(self.cache_dir, fname)
                with open(meta_path, "r", encoding="utf-8") as mf:
                    meta = json.load(mf)
                if str(meta.get("scene_role", "")).strip().lower() == role_norm:
                    mp4_candidate = os.path.join(self.cache_dir, fname[:-5] + ".mp4")
                    if os.path.exists(mp4_candidate) and os.path.getsize(mp4_candidate) > 0:
                        return mp4_candidate
        except Exception:
            return None
        return None

    def _resolve_fallback_path(self, fallback_file: Optional[str]) -> str:
        candidates = []
        if fallback_file:
            if os.path.isabs(fallback_file):
                candidates.append(fallback_file)
            else:
                candidates.append(os.path.join(self.project_dir, fallback_file))
                candidates.append(os.path.join(self.project_dir, "public", "assets", os.path.basename(fallback_file)))

        candidates.extend([
            os.path.join(self.project_dir, "public", "assets", "parvogel_case_01_seizure.mp4"),
            os.path.join(self.project_dir, "public", "assets", "parvogel_case_02_lethargy.mp4"),
            os.path.join(self.project_dir, "public", "assets", "parvogel_case_03_standing.mp4"),
            os.path.join(self.project_dir, "public", "assets", "parvogel_case_05_eating.mp4"),
        ])

        for path in candidates:
            if path and os.path.exists(path):
                return path

        return os.path.join(self.project_dir, fallback_file) if fallback_file else ""

    def _call_higgsfield_api(
        self,
        prompt: str,
        model: str,
        resolution: str,
        duration_sec: int,
        out_mp4_path: str,
    ) -> Optional[str]:
        """
        실제 Higgsfield API가 구성된 경우 720p B-roll 생성을 요청하고 MP4를 다운로드합니다.
        실패 시 None을 반환해 호출부가 로컬 검증 클립 폴백으로 안전하게 이어가도록 합니다.
        """
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if self.api_secret:
            headers["X-API-Secret"] = self.api_secret

        payload = {
            "model": model,
            "prompt": prompt,
            "resolution": resolution,
            "aspect_ratio": "9:16",
            "duration": duration_sec,
        }

        try:
            url = f"{self.base_url}{self.generate_endpoint}"
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            if resp.status_code not in (200, 201, 202):
                return None

            data = resp.json()
            video_url = data.get("video_url") or data.get("output", {}).get("url")
            job_id = data.get("id") or data.get("job_id")

            # 비동기 작업인 경우 폴링
            if not video_url and job_id:
                poll_url = f"{self.base_url}{self.generate_endpoint}/{job_id}"
                for _ in range(24):
                    time.sleep(5)
                    poll_resp = requests.get(poll_url, headers=headers, timeout=15)
                    if poll_resp.status_code != 200:
                        continue
                    poll_data = poll_resp.json()
                    status = str(poll_data.get("status", "")).lower()
                    if status in ("completed", "succeeded", "done"):
                        video_url = poll_data.get("video_url") or poll_data.get("output", {}).get("url")
                        break
                    if status in ("failed", "error", "canceled"):
                        return None

            if not video_url:
                return None

            media_resp = requests.get(video_url, timeout=60)
            if media_resp.status_code == 200 and media_resp.content:
                with open(out_mp4_path, "wb") as f:
                    f.write(media_resp.content)
                return out_mp4_path
        except Exception:
            return None

        return None

    def get_or_generate_broll(
        self,
        prompt: str,
        scene_role: str = "dog_situation_cut",
        duration_sec: int = 5,
        resolution: Optional[str] = "720p",
        model: Optional[str] = None,
        fallback_file: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        720p B-roll 수급 메인 메서드:
        1) 제품 용기/라벨 왜곡 가드 검증
        2) 해상도 720p 강제 고정
        3) SHA-256 디스크 캐시 조회
        4) API 키 존재 시 Higgsfield 720p 호출
        5) 키 미설정/오프라인 시 검증된 로컬 B-roll 폴백 반환
        """
        self.assert_no_product_distortion(scene_role=scene_role, prompt_text=prompt)
        locked_res = self.enforce_720p(resolution)
        resolved_model = self.resolve_model(model or self.default_model)
        safe_duration = max(3, min(int(duration_sec or 5), 10))

        profile = self.MODEL_PROFILES[resolved_model]
        scale = safe_duration / 5.0
        estimated_credits = round(profile["credits_per_5s"] * scale, 1)

        cache_key = self._compute_cache_key(resolved_model, locked_res, safe_duration, prompt)
        cached_mp4 = os.path.join(self.cache_dir, f"{cache_key}.mp4")
        cached_meta = os.path.join(self.cache_dir, f"{cache_key}.json")

        if os.path.exists(cached_mp4) and os.path.getsize(cached_mp4) > 0:
            return {
                "video_path": cached_mp4,
                "source": "disk_cache",
                "resolution": locked_res,
                "model": resolved_model,
                "duration_sec": safe_duration,
                "estimated_credits": 0,
                "cache_key": cache_key,
            }

        # 권장안 3 가드: 편당 신규 API 생성 상한(기본 1컷) 초과 시 동일 역할 캐시/로컬 폴백 우선 재사용
        if self._new_generations_this_run >= self.max_new_generations_per_run:
            role_cached = self._find_reusable_role_cache(scene_role)
            if role_cached:
                return {
                    "video_path": role_cached,
                    "source": "disk_cache_role_reuse",
                    "resolution": locked_res,
                    "model": resolved_model,
                    "duration_sec": safe_duration,
                    "estimated_credits": 0,
                    "cache_key": cache_key,
                }
            fallback_path = self._resolve_fallback_path(fallback_file)
            return {
                "video_path": fallback_path,
                "source": "local_fallback_budget_cap",
                "resolution": locked_res,
                "model": resolved_model,
                "duration_sec": safe_duration,
                "estimated_credits": 0,
                "cache_key": cache_key,
            }

        generated_path = self._call_higgsfield_api(
            prompt=prompt,
            model=resolved_model,
            resolution=locked_res,
            duration_sec=safe_duration,
            out_mp4_path=cached_mp4,
        )
        if generated_path and os.path.exists(generated_path):
            self._new_generations_this_run += 1
            with open(cached_meta, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "cache_key": cache_key,
                        "model": resolved_model,
                        "resolution": locked_res,
                        "duration_sec": safe_duration,
                        "scene_role": scene_role,
                        "prompt": prompt,
                        "estimated_credits": estimated_credits,
                    },
                    f,
                    ensure_ascii=False,
                    indent=2,
                )
            return {
                "video_path": generated_path,
                "source": "higgsfield_api",
                "resolution": locked_res,
                "model": resolved_model,
                "duration_sec": safe_duration,
                "estimated_credits": estimated_credits,
                "cache_key": cache_key,
            }

        fallback_path = self._resolve_fallback_path(fallback_file)
        return {
            "video_path": fallback_path,
            "source": "local_fallback",
            "resolution": locked_res,
            "model": resolved_model,
            "duration_sec": safe_duration,
            "estimated_credits": 0,
            "cache_key": cache_key,
        }

    @classmethod
    def estimate_monthly_cost(
        cls,
        episodes_per_month: int = 30,
        broll_cuts_per_episode: int = 2,
        cut_duration_sec: int = 5,
        model: str = "kling-3.0-720p",
        krw_per_usd: float = 1400.0,
        cache_hit_ratio: float = 0.0,
    ) -> Dict[str, Any]:
        """
        월간 쇼츠 제작 기준 크레딧 및 예상 비용 산출기.
        - 기본값: 30편/월, 편당 B-roll 2컷 (씬1 후킹 + 씬2/4 상황컷; 씬3 제품컷은 공식 실사 무료 합성)
        - 1080p 전체 생성 대비 720p + 하이브리드 실사 합성의 절감률을 함께 반환합니다.
        """
        resolved_model = cls.resolve_model(model)
        profile = cls.MODEL_PROFILES[resolved_model]

        duration_factor = max(1, int(cut_duration_sec)) / 5.0
        credits_per_cut_720p = profile["credits_per_5s"] * duration_factor
        credits_per_cut_1080p = profile["credits_per_5s_1080p"] * duration_factor

        total_cuts = episodes_per_month * broll_cuts_per_episode
        billable_cuts = total_cuts * max(0.0, min(1.0, 1.0 - cache_hit_ratio))

        monthly_credits_720p = round(billable_cuts * credits_per_cut_720p, 1)
        # 비교 기준: 같은 2컷을 1080p로 만들거나, 4컷 전체(15초)를 1080p AI로만 만들 때
        monthly_credits_1080p_same_cuts = round(total_cuts * credits_per_cut_1080p, 1)
        monthly_credits_1080p_full_4cuts = round(episodes_per_month * 4 * credits_per_cut_1080p, 1)

        usd_per_credit = profile["usd_per_credit"]
        monthly_usd = round(monthly_credits_720p * usd_per_credit, 2)
        monthly_krw = int(round(monthly_usd * krw_per_usd))

        savings_vs_1080p_same_pct = round(
            (1.0 - (monthly_credits_720p / monthly_credits_1080p_same_cuts)) * 100.0, 1
        ) if monthly_credits_1080p_same_cuts > 0 else 0.0
        savings_vs_full_ai_pct = round(
            (1.0 - (monthly_credits_720p / monthly_credits_1080p_full_4cuts)) * 100.0, 1
        ) if monthly_credits_1080p_full_4cuts > 0 else 0.0

        return {
            "assumptions": {
                "episodes_per_month": episodes_per_month,
                "broll_cuts_per_episode": broll_cuts_per_episode,
                "official_asset_cuts_per_episode": 1,
                "cut_duration_sec": cut_duration_sec,
                "model": resolved_model,
                "resolution": cls.LOCKED_RESOLUTION,
                "usd_per_credit_assumption": usd_per_credit,
                "krw_per_usd_assumption": krw_per_usd,
                "cache_hit_ratio": cache_hit_ratio,
            },
            "credits_per_cut_720p": credits_per_cut_720p,
            "credits_per_episode_720p": round(credits_per_cut_720p * broll_cuts_per_episode, 1),
            "monthly_credits_720p": monthly_credits_720p,
            "monthly_credits_1080p_same_cuts": monthly_credits_1080p_same_cuts,
            "monthly_credits_1080p_full_4cuts": monthly_credits_1080p_full_4cuts,
            "savings_vs_1080p_same_cuts_pct": savings_vs_1080p_same_pct,
            "savings_vs_1080p_full_ai_pct": savings_vs_full_ai_pct,
            "estimated_monthly_usd": monthly_usd,
            "estimated_monthly_krw": monthly_krw,
            "tts_cost_usd": 0.0,  # Edge-TTS 기본 무료
            "ffmpeg_render_cost_usd": 0.0,  # 로컬/GitHub Actions 무료
            "youtube_upload_cost_usd": 0.0,  # YouTube Data API v3 할당량 내 무료
        }
