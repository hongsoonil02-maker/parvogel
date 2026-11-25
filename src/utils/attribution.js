/**
 * Attribution utilities for parvogel.kr
 *
 * 1) captureInboundSource(): 방문자가 어디서 왔는지(카카오 광고 / 네이버 / 직접 등)를
 *    URL UTM 파라미터 또는 referrer로 판별해 7일간 보관합니다.
 * 2) decorateMallUrl(): 외부 쇼핑몰 링크에 UTM(+ 스마트스토어 nt_*) 파라미터를 붙여
 *    각 몰 판매자센터에서 "parvogel.kr 경유 + 원래 유입 채널"을 구분할 수 있게 합니다.
 *
 * 카카오모먼트 랜딩 URL 권장값:
 *   https://parvogel.kr/?utm_source=kakao&utm_medium=display&utm_campaign=moment_conv
 */

const STORAGE_KEY = 'pv_inbound_source';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 카카오 클릭 전환 기여 기간(7일)과 동일

const SITE_SOURCE = 'parvogel.kr';

function sanitize(value, max = 60) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9_\-.]/g, '_')
        .slice(0, max);
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
 * 외부몰 URL에 추적 파라미터 부여 (이미 부여된 경우 그대로 반환).
 * utm_source=parvogel.kr / utm_medium=<원래 유입채널> / utm_campaign=<원래 캠페인> / utm_content=<버튼 위치>
 */
export function decorateMallUrl(rawUrl, mallKey, placement = 'page') {
    let url;
    try {
        url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.href : undefined);
    } catch {
        return rawUrl;
    }
    if (url.searchParams.get('utm_source') === SITE_SOURCE) return rawUrl;

    const inbound = getInboundSource();
    const medium = inbound.source === 'direct' ? 'direct' : `${inbound.source}_${inbound.medium}`;

    url.searchParams.set('utm_source', SITE_SOURCE);
    url.searchParams.set('utm_medium', sanitize(medium));
    url.searchParams.set('utm_campaign', sanitize(inbound.campaign));
    url.searchParams.set('utm_content', sanitize(placement, 40));

    // 네이버 스마트스토어 '마케팅 분석 > 사용자 정의 채널' 은 nt_* 파라미터를 사용
    if (mallKey === 'smartstore') {
        url.searchParams.set('nt_source', SITE_SOURCE);
        url.searchParams.set('nt_medium', sanitize(medium));
        url.searchParams.set('nt_detail', sanitize(placement, 40));
        url.searchParams.set('nt_keyword', sanitize(inbound.campaign));
    }
    return url.toString();
}
