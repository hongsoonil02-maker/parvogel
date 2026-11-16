/**
 * Kakao Pixel Conversion Tracking Utility for parvogel.kr
 * Tracks outbound marketplace purchase-intent clicks (Coupang, Naver SmartStore,
 * Kakao Shopping, Gmarket, 11st, Toss Shopping), Kakao Channel consultations,
 * and B2B sample/wholesale form submissions.
 */

export const KAKAO_PIXEL_ID = '9019188145294848683';

function getPixel() {
    try {
        if (typeof window !== 'undefined' && typeof window.kakaoPixel === 'function') {
            return window.kakaoPixel(KAKAO_PIXEL_ID);
        }
    } catch {
        /* ignore */
    }
    return null;
}

export function trackKakaoViewContent(contentId = 'parvogel_golden_time') {
    const px = getPixel();
    if (!px) return;
    try {
        px.viewContent({ id: contentId });
    } catch {
        /* ignore */
    }
}

export function trackKakaoMallClick(mallKey) {
    const px = getPixel();
    if (!px) return;
    const tag = `mall_${mallKey}`;
    try {
        if (typeof px.addToCart === 'function') {
            px.addToCart({ id: tag });
        }
        if (typeof px.participation === 'function') {
            px.participation(tag);
        }
        if (typeof px.purchase === 'function') {
            px.purchase({
                total_quantity: '1',
                total_price: '18000',
                currency: 'KRW',
                products: [{ id: tag, name: `파보겔 (${mallKey})`, quantity: '1', price: '18000' }],
            });
        }
    } catch {
        /* ignore */
    }
}

export function trackKakaoChannelChat() {
    const px = getPixel();
    if (!px) return;
    try {
        if (typeof px.participation === 'function') {
            px.participation('kakao_channel_chat');
        }
    } catch {
        /* ignore */
    }
}

export function trackKakaoFormSubmit(requestType = 'consumer', quantity = 1) {
    const px = getPixel();
    if (!px) return;
    try {
        if (typeof px.completeRegistration === 'function') {
            px.completeRegistration(`submit_${requestType}`);
        }
        if (typeof px.participation === 'function') {
            px.participation(`submit_${requestType}`);
        }
        if ((requestType === 'consumer' || requestType === 'wholesale') && typeof px.purchase === 'function') {
            const qty = Math.max(1, Number(quantity) || 1);
            px.purchase({
                total_quantity: String(qty),
                total_price: String(qty * 30000),
                currency: 'KRW',
                products: [{ id: requestType, name: '파보겔 직영 주문', quantity: String(qty), price: '30000' }],
            });
        }
    } catch {
        /* ignore */
    }
}

const MALL_MATCHERS = [
    { match: 'coupang.com', key: 'coupang' },
    { match: 'smartstore.naver.com', key: 'smartstore' },
    { match: 'store.kakao.com', key: 'kakao_store' },
    { match: 'gmarket.co.kr', key: 'gmarket' },
    { match: '11st.co.kr', key: '11st' },
    { match: 'toss.shopping', key: 'toss' },
];

export function installGlobalKakaoLinkTracker() {
    if (typeof document === 'undefined') return () => {};

    const handleClick = (e) => {
        const anchor = e.target?.closest?.('a[href]');
        if (!anchor) return;
        const href = (anchor.getAttribute('href') || '').toLowerCase();
        if (!href || href.startsWith('#')) return;

        for (const { match, key } of MALL_MATCHERS) {
            if (href.includes(match)) {
                trackKakaoMallClick(key);
                return;
            }
        }
        if (href.includes('pf.kakao.com')) {
            trackKakaoChannelChat();
        }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
}
