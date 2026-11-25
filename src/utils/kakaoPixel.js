/**
 * Kakao Pixel Conversion Tracking Utility for parvogel.kr
 * Tracks outbound marketplace purchase-intent clicks (Coupang, Naver SmartStore,
 * Kakao Shopping, Gmarket, Auction, 11st, Toss Shopping), Kakao Channel consultations,
 * and direct consumer order form submissions.
 */

import { captureInboundSource, decorateMallUrl, getPlacement } from './attribution';
import { initClarity, clarityTag, clarityEvent } from './clarity';

export const KAKAO_PIXEL_ID = '9019188145294848683';

export const PRODUCT_UNIT_PRICES = {
    'parvogel-100ml': 18000,
    'parvogel-200ml': 30000,
    'parvogel-500ml': 60000,
};

function getUnitPrice(productId) {
    return PRODUCT_UNIT_PRICES[productId] || 18000;
}

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
        px.viewContent({
            products: [
                {
                    id: contentId,
                    name: '파보겔 100ml (ParvoGel)',
                    quantity: '1',
                    price: '18000',
                },
            ],
        });
    } catch {
        /* ignore */
    }
}

/**
 * Outbound marketplace link click (Coupang, SmartStore, Kakao Shopping, etc.).
 * Intentionally fires addToCart + participation ONLY — never purchase —
 * so outbound clicks do not inflate Kakao Moment Purchase/ROAS metrics.
 * Actual Kakao TalkStore purchases are measured natively by the linked store pixel.
 */
export function trackKakaoMallClick(mallKey, productId = 'parvogel-100ml') {
    const px = getPixel();
    if (!px) return;
    const tag = `mall_${mallKey}`;
    const unitPrice = String(getUnitPrice(productId));
    const product = { id: `${tag}_${productId}`, name: `파보겔 (${mallKey})`, quantity: '1', price: unitPrice };
    try {
        if (typeof px.addToCart === 'function') {
            px.addToCart({
                total_quantity: '1',
                total_price: unitPrice,
                currency: 'KRW',
                products: [product],
            });
        }
        if (typeof px.participation === 'function') {
            px.participation(tag);
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

export function trackKakaoFormSubmit(requestType = 'consumer', quantity = 1, productId = 'parvogel-100ml') {
    clarityEvent(`order_submit_${requestType}`);
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
            const unitPrice = getUnitPrice(productId);
            px.purchase({
                total_quantity: String(qty),
                total_price: String(qty * unitPrice),
                currency: 'KRW',
                products: [
                    {
                        id: productId || requestType,
                        name: `파보겔 직영 주문 (${productId || '100ml'})`,
                        quantity: String(qty),
                        price: String(unitPrice),
                    },
                ],
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
    { match: 'auction.co.kr', key: 'auction' },
    { match: '11st.co.kr', key: '11st' },
    { match: 'toss.shopping', key: 'toss' },
];

function matchMall(href) {
    const lower = (href || '').toLowerCase();
    for (const { match, key } of MALL_MATCHERS) {
        if (lower.includes(match)) return key;
    }
    return null;
}

/**
 * 외부몰 <a> 태그의 href에 UTM을 붙임. 클릭/가운데클릭/길게누르기/우클릭 직전에 실행되어
 * 새 탭 열기, 링크 복사 등 모든 이동 경로에 파라미터가 포함됩니다.
 */
function decorateAnchor(anchor) {
    const href = anchor.getAttribute('href') || '';
    const mallKey = matchMall(href);
    if (!mallKey) return null;
    const decorated = decorateMallUrl(href, mallKey, getPlacement(anchor));
    if (decorated !== href) anchor.setAttribute('href', decorated);
    return mallKey;
}

export function installGlobalKakaoLinkTracker() {
    if (typeof document === 'undefined') return () => {};

    const inbound = captureInboundSource();
    initClarity();
    clarityTag('traffic_source', inbound.source);
    clarityTag('traffic_campaign', inbound.campaign);
    if (inbound.content) clarityTag('traffic_content', inbound.content);

    const handlePreNavigate = (e) => {
        const anchor = e.target?.closest?.('a[href]');
        if (anchor) decorateAnchor(anchor);
    };

    const handleClick = (e) => {
        const anchor = e.target?.closest?.('a[href]');
        if (!anchor) return;
        const href = anchor.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;

        const mallKey = decorateAnchor(anchor);
        if (mallKey) {
            const productId = anchor.getAttribute('data-product-id') || 'parvogel-100ml';
            trackKakaoMallClick(mallKey, productId);
            clarityEvent(`mall_click_${mallKey}`);
            return;
        }
        if (href.toLowerCase().includes('pf.kakao.com')) {
            trackKakaoChannelChat();
            clarityEvent('kakao_channel_chat');
        }
    };

    const preEvents = ['pointerdown', 'touchstart', 'contextmenu', 'auxclick', 'focusin'];
    preEvents.forEach((type) => document.addEventListener(type, handlePreNavigate, { capture: true, passive: true }));
    document.addEventListener('click', handleClick, { capture: true });
    return () => {
        preEvents.forEach((type) => document.removeEventListener(type, handlePreNavigate, { capture: true }));
        document.removeEventListener('click', handleClick, { capture: true });
    };
}
