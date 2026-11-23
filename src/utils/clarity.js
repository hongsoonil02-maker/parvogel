/**
 * Microsoft Clarity (무료 히트맵 / 세션 녹화)
 *
 * 설정 방법:
 *  1. https://clarity.microsoft.com 접속 → 새 프로젝트 생성 (사이트: parvogel.kr)
 *  2. 설정 > 개요 의 "프로젝트 ID"(영문+숫자 10자 내외)를 아래 CLARITY_PROJECT_ID 에 입력
 *     (또는 빌드 환경변수 VITE_CLARITY_PROJECT_ID 로 지정)
 *  ※ 프로젝트 ID는 페이지 소스에 공개되는 값이라 코드에 넣어도 안전합니다.
 *
 * Clarity는 기본적으로 입력창(이름·연락처·주소)을 마스킹하므로 주문 폼 개인정보는 녹화되지 않습니다.
 */

const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'zi3higndpj';

let initialized = false;

export function initClarity() {
    if (initialized || typeof window === 'undefined') return;
    if (typeof window.clarity === 'function') {
        initialized = true;
        return;
    }
    const id = String(CLARITY_PROJECT_ID).trim();
    if (!/^[a-z0-9]{6,20}$/i.test(id)) return; // ID 미설정 시 아무것도 하지 않음
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
    initialized = true;

    (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', id);
}

/** 세션 필터용 태그 (예: traffic_source = kakao) */
export function clarityTag(key, value) {
    try {
        if (typeof window.clarity === 'function') window.clarity('set', key, String(value));
    } catch {
        /* ignore */
    }
}

/** 스마트 이벤트 (예: mall_click_coupang) */
export function clarityEvent(name) {
    try {
        if (typeof window.clarity === 'function') window.clarity('event', name);
    } catch {
        /* ignore */
    }
}
