/**
 * Attribution utilities for parvogel.kr - UTM Standard v2.0
 *
 * 1) captureInboundSource(): 방문자가 어디서 왔는지(카카오 광고 / 네이버 / 직접 등)를
 *    URL UTM 파라미터 또는 referrer로 판별해 30일간 보관합니다 (어트리뷰션 룩백 윈도우).
 * 2) decorateMallUrl(): 외부 쇼핑몰 링크에 표준 UTM 파라미터를 붙여
 *    각 몰 판매자센터에서 "parvogel.kr 경유 + 원래 유입 채널 + 콘텐츠 필라 + 배치"를 구분할 수 있게 합니다.
 *
 * UTM 네이밍 컨벤션 (data_infrastructure.json 기준):
 *   utm_source=parvogel.kr
 *   utm_medium={platform}_organic (예: youtube_shorts_organic, instagram_reels_organic)
 *   utm_campaign={content_pillar}_{YYYYMM} (예: clinical_documentary_202611)
 *   utm_content={placement}_{version} (예: hero_main_cta_empathy)
 *
 * 카카오모먼트 랜딩 URL 권장값:
 *   https://parvogel.kr/?utm_source=kakao&utm_medium=display&utm_campaign=moment_conv
 */

const STORAGE_KEY = 'pv_inbound_source';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 어트리뷰션 룩백 윈도우 30일

const SITE_SOURCE = 'parvogel.kr';

// 플랫폼별 medium 매핑
const PLATFORM_MEDIUMS = {
  'youtube_shorts': 'youtube_shorts_organic',
  'instagram_reels': 'instagram_reels_organic',
  'tiktok': 'tiktok_organic',
  'naver_blog': 'naver_blog_organic',
  'threads': 'threads_organic',
  'facebook_page': 'facebook_organic',
  'bluesky': 'bluesky_organic',
  'kakao_channel': 'kakao_channel_organic',
  'email_newsletter': 'email_organic',
  'direct': 'direct_none'
};

// 콘텐츠 필라 매핑
const CONTENT_PILLARS = {
  'clinical_documentary': 'clinical_documentary',
  'education_feeding': 'education_feeding',
  'recovery_eating': 'recovery_eating',
  'vet_authority': 'vet_authority',
  'parrot_bird_case': 'parrot_bird_case',
  'early_care_prevention': 'early_care_prevention',
  'value_comparison': 'value_comparison',
  'weekly_roundup': 'weekly_roundup'
};

// 버전 매핑
const VERSIONS = {
  'version_a': 'empathy',
  'version_b': 'mechanism',
  'version_c': 'farm',
  'version_d': 'pump_guide',
  'version_e': 'ranking'
};

function sanitize(value, max = 60) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9_\-.]/g, '_')
        .slice(0, max);
}

function getCurrentCampaignId() {
    const now = new Date();
    const yyyymm = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
    return yyyymm;
}

function readUrlParams() {
    if (typeof window === 'undefined') return new URLSearchParams();
    const params = new URLSearchParams(window.location.search);
    // HashRouter 대응: #/path?utm_source=... 형태도 읽음
    const hash = window.location.hash || '';
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
        new URLSearchParams(hash.slice(qIdx + 1)).forEach((v, k) => {
            if (!params.has(k)) params.set(k, v);
        });
    }
    return params;
}

function sourceFromReferrer() {
    if (typeof document === 'undefined' || !document.referrer) return null;
    let host = '';
    try {
        host = new URL(document.referrer).hostname;
    } catch {
        return null;
    }
    if (!host || host.endsWith('parvogel.kr') || host === window.location.hostname) return null;
    if (/kakao|daum/.test(host)) return { source: 'kakao', medium: 'referral', campaign: 'none' };
    if (/naver/.test(host)) return { source: 'naver', medium: 'referral', campaign: 'none' };
    if (/google/.test(host)) return { source: 'google', medium: 'organic', campaign: 'none' };
    if (/instagram|facebook/.test(host)) return { source: 'meta', medium: 'referral', campaign: 'none' };
    return { source: sanitize(host), medium: 'referral', campaign: 'none' };
}

/** 페이지 진입 시 1회 호출. 새로운 유입 신호가 있으면 덮어씀(last non-direct touch). */
export function captureInboundSource() {
    if (typeof window === 'undefined') return getInboundSource();
    const params = readUrlParams();
    let detected = null;

    if (params.get('utm_source')) {
        detected = {
            source: sanitize(params.get('utm_source')),
            medium: sanitize(params.get('utm_medium') || 'unknown'),
            campaign: sanitize(params.get('utm_campaign') || 'none'),
        };
        // UTM 표기 통일: 과거 소재의 변형 값(kakao_moment / paid_ad)을 표준값으로 정규화
        if (detected.source === 'kakao_moment' || detected.source === 'kakaomoment') detected.source = 'kakao';
        if (detected.source === 'kakao' && (detected.medium === 'paid_ad' || detected.medium === 'paid')) {
            detected.medium = 'display';
        }
        const content = params.get('utm_content');
        if (content) detected.content = sanitize(content, 40);
    } else {
        detected = sourceFromReferrer();
    }

    if (detected) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...detected, ts: Date.now() }));
        } catch {
            /* ignore */
        }
        return detected;
    }
    return getInboundSource();
}

/** 저장된 유입 채널 반환. 없거나 만료 시 direct. */
export function getInboundSource() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (data && Date.now() - (data.ts || 0) < TTL_MS) {
                return { source: data.source, medium: data.medium, campaign: data.campaign, content: data.content };
            }
        }
    } catch {
        /* ignore */
    }
    return { source: 'direct', medium: 'none', campaign: 'none' };
}

/** 링크가 페이지 어디에 있었는지(버튼 위치) 추정 */
export function getPlacement(anchor) {
    if (!anchor) return 'unknown';
    const explicit = anchor.closest?.('[data-placement]')?.getAttribute('data-placement');
    if (explicit) return sanitize(explicit, 40);
    const section = anchor.closest?.('section[id], [id]');
    if (section?.id) return sanitize(section.id, 40);
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/blog')) return 'blog';
    return 'page';
}

/**
 * 콘텐츠 필라 감지 (현재 페이지/섹션 기반)
 */
export function detectContentPillar() {
    if (typeof window === 'undefined') return 'clinical_documentary';
    
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // 블로그 글별 필라 감지
    if (path.includes('/blog/')) {
        if (path.includes('parvo-recovery') || path.includes('acute-diarrhea')) return 'clinical_documentary';
        if (path.includes('medicine-guide') || path.includes('ingredients')) return 'vet_authority';
        if (path.includes('parrot') || path.includes('bird')) return 'parrot_bird_case';
        return 'education_feeding';
    }
    
    // 섹션별 필라 감지
    if (hash.includes('parvogel-clinical-doc') || hash.includes('clinical')) return 'clinical_documentary';
    if (hash.includes('why-parvogel') || hash.includes('nano-action')) return 'vet_authority';
    if (hash.includes('vet-voice')) return 'vet_authority';
    if (hash.includes('gomi') || hash.includes('bird')) return 'parrot_bird_case';
    if (hash.includes('order') || hash.includes('products')) return 'value_comparison';
    
    // 기본값
    return 'clinical_documentary';
}

/**
 * 버전 감지 (A/B 테스트용)
 */
export function detectVersion() {
    // 랜덤 또는 시간 기반으로 버전 할당 (실제로는 쿠키/로컬스토리지 기반 고정 권장)
    const hour = new Date().getHours();
    const versions = ['empathy', 'mechanism', 'farm', 'pump_guide', 'ranking'];
    return versions[hour % versions.length];
}

/**
 * 외부몰 URL에 표준 UTM 파라미터 부여 (이미 부여된 경우 그대로 반환).
 * utm_source=parvogel.kr / utm_medium={platform}_organic / utm_campaign={pillar}_{YYYYMM} / utm_content={placement}_{version}
 */
export function decorateMallUrl(rawUrl, mallKey, placement = 'page', platform = 'unknown') {
    let url;
    try {
        url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.href : undefined);
    } catch {
        return rawUrl;
    }
    if (url.searchParams.get('utm_source') === SITE_SOURCE) return rawUrl;

    const inbound = getInboundSource();
    const pillar = detectContentPillar();
    const version = detectVersion();
    const yyyymm = getCurrentCampaignId();
    
    // medium 결정: 플랫폼별 매핑 우선, 없으면 inbound 기반
    let medium = PLATFORM_MEDIUMS[platform] || (inbound.source === 'direct' ? 'direct_none' : `${inbound.source}_${inbound.medium}`);

    url.searchParams.set('utm_source', SITE_SOURCE);
    url.searchParams.set('utm_medium', sanitize(medium));
    url.searchParams.set('utm_campaign', sanitize(`${pillar}_${yyyymm}`));
    url.searchParams.set('utm_content', sanitize(`${placement}_${version}`, 40));

    // 네이버 스마트스토어 '마케팅 분석 > 사용자 정의 채널' 은 nt_* 파라미터를 사용
    if (mallKey === 'smartstore') {
        url.searchParams.set('nt_source', SITE_SOURCE);
        url.searchParams.set('nt_medium', sanitize(medium));
        url.searchParams.set('nt_detail', sanitize(placement, 40));
        url.searchParams.set('nt_keyword', sanitize(`${pillar}_${yyyymm}`));
    }
    return url.toString();
}

/**
 * 현재 페이지의 표준 UTM 파라미터 객체 반환 (내부 링크용)
 */
export function getCurrentUtmParams() {
    const inbound = getInboundSource();
    const pillar = detectContentPillar();
    const version = detectVersion();
    const yyyymm = getCurrentCampaignId();
    const medium = inbound.source === 'direct' ? 'direct_none' : `${inbound.source}_${inbound.medium}`;
    
    return {
        utm_source: SITE_SOURCE,
        utm_medium: medium,
        utm_campaign: `${pillar}_${yyyymm}`,
        utm_content: `internal_${version}`
    };
}

/**
 * 내부 링크에 UTM 파라미터 추가
 */
export function decorateInternalUrl(rawUrl, placement = 'internal_link') {
    let url;
    try {
        url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.href : undefined);
    } catch {
        return rawUrl;
    }
    
    const params = getCurrentUtmParams();
    params.utm_content = sanitize(`${placement}_${detectVersion()}`, 40);
    
    Object.entries(params).forEach(([key, value]) => {
        if (!url.searchParams.has(key)) {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}
