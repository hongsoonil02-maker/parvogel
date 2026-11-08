#!/usr/bin/env python3
"""
Ranking Shorts Generator — 노마드크리스TV 스타일 9:16 랭킹형 숏폼 자동 생성 코어 모듈
- 파보겔 마케팅 팩토리 정규 엔진
- 요일별/테마별 5대 랭킹 시나리오 (실수/응급대처/투약전쟁 TOP 5) 자동 로테이션
- 기존 방송자막/말풍선 영역 자동 가우시안 블러 마스킹
- 9:16 세로(1080x1920) 리프레이밍
- 좌측 상단 언베일링(Unveiling) 동적 랭킹 보드 HUD 오버레이
- 가슴선(Chest-height) 2~3단어 호흡 숏폼 볼드 자막 오버레이
- 유튜브 쇼츠 / 틱톡 / 릴스 제목 3종 + 고정 댓글 전환 문구 자동 생성
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from typing import List, Dict, Any, Optional

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FACTORY_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(FACTORY_DIR)
ASSETS_DIR = os.path.join(PROJECT_DIR, "public", "assets")
OUTPUT_DIR = os.path.join(FACTORY_DIR, "output", "ranking_shorts")

os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = "C:/Windows/Fonts/malgunbd.ttf" if os.path.exists("C:/Windows/Fonts/malgunbd.ttf") else "C:/Windows/Fonts/malgun.ttf"
SAFE_FONT = FONT_PATH.replace("\\", "/").replace(":", r"\:")


class ParvogelRankingShortsGenerator:
    """파보겔 전용 노마드크리스형 랭킹 숏폼 자동 생성기"""

    def __init__(self):
        self.assets_dir = ASSETS_DIR
        self.output_dir = OUTPUT_DIR

        # 요일별(월~일) 7개 고효율 바이럴 랭킹 프리셋 시나리오
        self.scenarios = [
            # 0: 월요일
            {
                "board_title": "강아지 설사 치명적 실수 TOP 5",
                "items": [
                    {"rank": 5, "title": "사람 지사제 먹이기", "start": 0.0, "end": 9.0,
                     "subtitles": [
                         {"text": "5위! 사람 지사제 먹이기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "독소가 장에 갇혀서 패혈증 옵니다", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 4, "title": "물 억지로 먹이기", "start": 9.5, "end": 19.0,
                     "subtitles": [
                         {"text": "4위! 물을 억지로 먹이기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "오히려 위경련과 극심한 구토 유발", "rel_start": 4.6, "rel_end": 9.0}
                     ]},
                    {"rank": 3, "title": "무작정 굶기기만 하기", "start": 20.0, "end": 29.5,
                     "subtitles": [
                         {"text": "3위! 무작정 굶기기만 하기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "젖먹이 강아지는 탈수 저혈당 쇼크", "rel_start": 4.6, "rel_end": 9.0}
                     ]},
                    {"rank": 2, "title": "가루약 억지 투약", "start": 30.0, "end": 40.0,
                     "subtitles": [
                         {"text": "2위! 쓴 가루약 강제 투약", "rel_start": 0.5, "rel_end": 4.8},
                         {"text": "흡인성 폐렴 위험과 극심한 스트레스", "rel_start": 4.9, "rel_end": 9.5}
                     ]},
                    {"rank": 1, "title": "장점막 코팅 없이 방치", "start": 41.0, "end": 52.0,
                     "subtitles": [
                         {"text": "대망의 1위! 장점막 코팅 방치", "rel_start": 0.5, "rel_end": 5.0},
                         {"text": "1초 펌프로 물리적 코팅이 필수!", "rel_start": 5.1, "rel_end": 10.5}
                     ]}
                ]
            },
            # 1: 화요일
            {
                "board_title": "새벽 피설사 응급실 가기 전 TOP 5",
                "items": [
                    {"rank": 5, "title": "문 연 병원만 검색하다 시간 날리기", "start": 2.0, "end": 11.0,
                     "subtitles": [
                         {"text": "5위! 병원 찾다가 1시간 허비", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "새벽 2시 골든타임 다 날아갑니다", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 4, "title": "체온 떨어지는데 방치", "start": 12.0, "end": 21.0,
                     "subtitles": [
                         {"text": "4위! 체온 저하 방치하기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "담요로 보온 유지가 최우선입니다", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 3, "title": "우유나 간식 먹이기", "start": 22.0, "end": 31.0,
                     "subtitles": [
                         {"text": "3위! 기운 차리라고 우유 먹이기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "유당 불내증으로 설사 폭발합니다", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 2, "title": "사람용 활성탄 먹이기", "start": 32.0, "end": 41.0,
                     "subtitles": [
                         {"text": "2위! 검증 안 된 활성탄 먹이기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "장폐색과 전해질 불균형 위험", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 1, "title": "1초 만에 잇몸 장점막 코팅", "start": 42.0, "end": 52.0,
                     "subtitles": [
                         {"text": "1위! 1초 잇몸 장점막 코팅", "rel_start": 0.5, "rel_end": 4.8},
                         {"text": "병원 이동 전 나노 겔로 버티기!", "rel_start": 4.9, "rel_end": 9.5}
                     ]}
                ]
            },
            # 2: 수요일
            {
                "board_title": "약 먹이기 전쟁 끝내는 꿀팁 TOP 5",
                "items": [
                    {"rank": 5, "title": "사료에 가루약 몰래 섞기", "start": 0.0, "end": 9.0,
                     "subtitles": [
                         {"text": "5위! 사료에 가루약 섞기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "냄새 맡고 밥그릇 자체를 거부함", "rel_start": 4.6, "rel_end": 8.5}
                     ]},
                    {"rank": 4, "title": "주사기로 목구멍 찌르기", "start": 10.0, "end": 19.5,
                     "subtitles": [
                         {"text": "4위! 주사기로 목구멍 찌르기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "식도 상처와 투약 트라우마 발생", "rel_start": 4.6, "rel_end": 9.0}
                     ]},
                    {"rank": 3, "title": "딸기잼/치즈에 숨기기", "start": 20.5, "end": 30.0,
                     "subtitles": [
                         {"text": "3위! 달달한 잼에 숨기기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "장염 환견에게 고당분은 독약", "rel_start": 4.6, "rel_end": 9.0}
                     ]},
                    {"rank": 2, "title": "억지로 입 벌리다 물리기", "start": 31.0, "end": 40.5,
                     "subtitles": [
                         {"text": "2위! 억지로 입 벌리다 물리기", "rel_start": 0.5, "rel_end": 4.5},
                         {"text": "아이도 집사도 피 보는 대참사", "rel_start": 4.6, "rel_end": 9.0}
                     ]},
                    {"rank": 1, "title": "입가에 1초 펌프 누르면 촵촵", "start": 41.5, "end": 52.0,
                     "subtitles": [
                         {"text": "대망의 1위! 1초 펌프 누르기", "rel_start": 0.5, "rel_end": 5.0},
                         {"text": "기호성 폭발로 알아서 핥아먹음!", "rel_start": 5.1, "rel_end": 10.0}
                     ]}
                ]
            }
        ]

    def generate_daily_ranking_shorts(self, day_index: Optional[int] = None, date_tag: Optional[str] = None) -> Optional[str]:
        """일일 마케팅 팩토리 연동용 랭킹 숏폼 자동 생성"""
        if not date_tag:
            date_tag = datetime.now().strftime("%Y%m%d")

        if day_index is None:
            day_index = datetime.now().weekday() % len(self.scenarios)
        else:
            day_index = day_index % len(self.scenarios)

        scenario = self.scenarios[day_index]
        board_title = scenario["board_title"]
        items = scenario["items"]

        # 원본 소스 선택 (다큐멘터리 우선)
        src_video = os.path.join(self.assets_dir, "parvogel_clinical_documentary_v2.mp4")
        if not os.path.exists(src_video):
            candidates = [
                os.path.join(self.assets_dir, "parvogel_case_01_seizure.mp4"),
                os.path.join(self.assets_dir, "parvogel_case_02_lethargy.mp4")
            ]
            src_video = next((c for c in candidates if os.path.exists(c)), None)

        if not src_video:
            print("[WARN] Ranking Shorts Generator: Source video asset not found.")
            return None

        out_filename = f"Shorts_Ranking_{day_index+1}_{date_tag}.mp4"
        out_path = os.path.join(self.output_dir, out_filename)

        print(f"🎬 [RANKING_SHORTS] Composing: '{board_title}' -> {out_filename}")

        # 클립 타임라인 재계산
        current_timeline = 0.0
        for it in items:
            dur = it["end"] - it["start"]
            it["timeline_start"] = current_timeline
            it["timeline_end"] = current_timeline + dur
            current_timeline += dur

        # FFmpeg filtergraph 조립
        filter_parts = []
        concat_pairs = []

        for idx, it in enumerate(items):
            v_trim = f"[0:v]trim=start={it['start']}:end={it['end']},setpts=PTS-STARTPTS[v{idx}];"
            a_trim = f"[0:a]atrim=start={it['start']}:end={it['end']},asetpts=PTS-STARTPTS[a{idx}];"
            filter_parts.append(v_trim)
            filter_parts.append(a_trim)
            concat_pairs.append(f"[v{idx}][a{idx}]")

        n_clips = len(items)
        concat_filter = f"{''.join(concat_pairs)}concat=n={n_clips}:v=1:a=1[v_cat][a_cat];"
        filter_parts.append(concat_filter)

        # 9:16 리프레이밍 + 하단 기존 자막 블러 (y=1420~1820)
        base_v = (
            "[v_cat]scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920,split=2[v_main][v_crop_blur];"
            "[v_crop_blur]crop=1080:400:0:1420,boxblur=luma_radius=20:luma_power=2[v_blurred];"
            "[v_main][v_blurred]overlay=0:1420[v_base];"
        )
        filter_parts.append(base_v)

        # 좌측 상단 언베일링 HUD 박스
        board_box = (
            "[v_base]drawbox=x=35:y=65:w=450:h=390:color=black@0.78:t=fill,"
            "drawbox=x=35:y=65:w=450:h=52:color=red@0.90:t=fill,"
            f"drawtext=fontfile='{SAFE_FONT}':text='{board_title[:18]}':fontcolor=white:fontsize=28:x=45:y=76"
        )
        curr_stream = "[v_board0]"
        filter_parts.append(f"{board_box}{curr_stream};")

        for idx, it in enumerate(items):
            rank_num = it["rank"]
            rank_title = it["title"]
            t_start = it["timeline_start"]
            t_end = it["timeline_end"]
            y_pos = 135 + (idx * 52)

            t_before = f"lt(t,{t_start})"
            t_current = f"between(t,{t_start},{t_end})"
            t_after = f"gte(t,{t_end})"

            next_stream = f"[v_board{idx+1}]"
            rank_filter = (
                f"{curr_stream}"
                f"drawtext=fontfile='{SAFE_FONT}':text='{rank_num}위  ? ? ? ? ?':fontcolor=white@0.35:fontsize=25:x=50:y={y_pos}:enable='{t_before}',"
                f"drawbox=x=42:y={y_pos-4}:w=435:h=38:color=yellow@0.22:t=fill:enable='{t_current}',"
                f"drawtext=fontfile='{SAFE_FONT}':text='▶ {rank_num}위  {rank_title}':fontcolor=yellow:fontsize=26:x=48:y={y_pos}:enable='{t_current}',"
                f"drawtext=fontfile='{SAFE_FONT}':text='✓ {rank_num}위  {rank_title}':fontcolor=white@0.75:fontsize=25:x=48:y={y_pos}:enable='{t_after}'"
                f"{next_stream};"
            )
            filter_parts.append(rank_filter)
            curr_stream = next_stream

        # 가슴선(Chest-level) 숏폼 자막 (y=1180)
        final_v_stream = "[v_final]"
        subtitle_draws = []
        for it in items:
            for sub in it.get("subtitles", []):
                s_txt = sub.get("text", "").replace(":", " ").replace("'", "").replace('"', "")
                s_start = it["timeline_start"] + sub.get("rel_start", 0.0)
                s_end = it["timeline_start"] + sub.get("rel_end", 2.5)
                draw_sub = (
                    f"drawtext=fontfile='{SAFE_FONT}':text='{s_txt}':"
                    f"fontcolor=white:bordercolor=black:borderw=6:fontsize=48:"
                    f"x=(w-text_w)/2:y=1180:enable='between(t,{s_start},{s_end})'"
                )
                subtitle_draws.append(draw_sub)

        if subtitle_draws:
            filter_parts.append(f"{curr_stream}{','.join(subtitle_draws)}{final_v_stream};")
        else:
            filter_parts.append(f"{curr_stream}null{final_v_stream};")

        full_filtergraph = "".join(filter_parts)

        cmd = [
            "ffmpeg", "-y",
            "-i", src_video,
            "-filter_complex", full_filtergraph,
            "-map", "[v_final]",
            "-map", "[a_cat]",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "19",
            "-c:a", "aac",
            "-b:a", "192k",
            out_path
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and os.path.exists(out_path):
                size_mb = os.path.getsize(out_path) / (1024 * 1024)
                print(f"✓ [RANKING_SHORTS_SUCCESS] Generated: {out_filename} ({size_mb:.2f} MB)")
                
                # 메타데이터 생성
                meta_path = os.path.splitext(out_path)[0] + "_meta.txt"
                self._save_metadata(meta_path, board_title)
                return out_path
            else:
                print(f"[RANKING_SHORTS_ERROR] {res.stderr[-500:]}")
                return None
        except Exception as e:
            print(f"[RANKING_SHORTS_EXCEPTION] {e}")
            return None

    def _save_metadata(self, meta_path: str, board_title: str):
        meta_content = f"""======================================================================
🔥 [노마드크리스형 랭킹 쇼츠 메타데이터]
======================================================================
📌 보드 타이틀: {board_title}

🎯 [유튜브 쇼츠 추천 제목 3종]
1. {board_title} 충격 실화... 1위는 99%가 모릅니다
2. 설마 아직도 이렇게 하세요? 수의사가 기겁한 최악의 대처 TOP 5
3. 응급실 가기 전 필수 시청! 1위 대처법 몰라서 골든타임 날립니다

💬 [고정 댓글 추천 문구]
"영상 끝까지 봐주셔서 감사합니다! 
특히 1위 대처법은 새벽 응급 상황에서 아이 생명을 살리는 핵심 골든타임 수칙입니다.

👉 1초 만에 장 점막 물리 코팅하는 상비 겔(파보겔/몬스멕타) 정보:
   https://smartstore.naver.com/petschury/products/13718496355"
======================================================================
"""
        with open(meta_path, "w", encoding="utf-8") as f:
            f.write(meta_content)


if __name__ == "__main__":
    generator = ParvogelRankingShortsGenerator()
    out = generator.generate_daily_ranking_shorts(day_index=0)
    print("Result:", out)
