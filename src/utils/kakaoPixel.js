/**
 * Kakao Pixel + GA4 + Clarity Conversion Tracking Utility for parvogel.kr
 * Tracks outbound marketplace purchase-intent clicks (Coupang, Naver SmartStore,
 * Kakao Shopping, Gmarket, Auction, 11st, Toss Shopping), Kakao Channel consultations,
 * direct consumer order form submissions, and comprehensive funnel events.
 */

import { captureInboundSource, decorateMallUrl, getPlacement, detectContentPillar, detectVersion, getCurrentUtmParams } from './attribution';
import { initClarity, clarityTag, clarityEvent } from './clarity';

export const KAKAO_PIXEL_ID = '9019188145294848683';
export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-TCS7K95KBC';

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

function getGA4() {
    try {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            return window.gtag;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function getGTM() {
    try {
        if (typeof window !== 'undefined' && typeof window.dataLayer !== 'undefined') {
            return window.dataLayer;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function pushGTM(eventName, parameters = {}) {
    const gtm = getGTM();
    if (gtm) {
        gtm.push({ event: eventName, ...parameters });
    }
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
    
    // GA4 page_view with enhanced ecommerce
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'view_item', {
            currency: 'KRW',
            value: 18000,
            items: [{
                item_id: contentId,
                item_name: '파보겔 100ml (ParvoGel)',
                item_category: '반려동물 보조사료',
                price: 18000,
                quantity: 1,
            }]
        });
    }
}

/**
 * Outbound marketplace link click (Coupang, SmartStore, Kakao Shopping, etc.).
 * Fires addToCart + participation for Kakao Pixel, and select_item for GA4.
 * Uses standardized UTM parameters from attribution.js
 */
export function trackKakaoMallClick(mallKey, productId = 'parvogel-100ml', placement = 'unknown', platform = 'unknown') {
    const px = getPixel();
    const ga4 = getGA4();
    const tag = `mall_${mallKey}`;
    const unitPrice = String(getUnitPrice(productId));
    const product = { id: `${tag}_${productId}`, name: `파보겔 (${mallKey})`, quantity: '1', price: unitPrice };
    
    // Kakao Pixel
    if (px) {
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
    
    // GA4 select_item with enhanced ecommerce
    if (ga4) {
        ga4('event', 'select_item', {
            item_list_id: 'official_stores',
            item_list_name: '공식 입점 쇼핑몰',
            items: [{
                item_id: productId,
                item_name: `파보겔 (${mallKey})`,
                item_category: '반려동물 보조사료',
                item_variant: mallKey,
                price: Number(unitPrice),
                quantity: 1,
                index: 0,
            }]
        });
    }
    
    // Clarity with enhanced context
    const pillar = detectContentPillar();
    const version = detectVersion();
    clarityEvent(`mall_click_${mallKey}`, { 
        placement, 
        productId, 
        platform,
        pillar,
        version
    });
}

export function trackKakaoChannelChat() {
    const px = getPixel();
    const ga4 = getGA4();
    if (px) {
        try {
            if (typeof px.participation === 'function') {
                px.participation('kakao_channel_chat');
            }
        } catch {
            /* ignore */
        }
    }
    if (ga4) {
        ga4('event', 'contact', {
            method: 'kakao_channel',
            currency: 'KRW',
        });
    }
    clarityEvent('kakao_channel_chat');
}

export function trackKakaoFormSubmit(requestType = 'consumer', quantity = 1, productId = 'parvogel-100ml') {
    clarityEvent(`order_submit_${requestType}`);
    const px = getPixel();
    const ga4 = getGA4();
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = getUnitPrice(productId);
    const totalPrice = qty * unitPrice;
    
    // Kakao Pixel
    if (px) {
        try {
            if (typeof px.completeRegistration === 'function') {
                px.completeRegistration(`submit_${requestType}`);
            }
            if (typeof px.participation === 'function') {
                px.participation(`submit_${requestType}`);
            }
            if ((requestType === 'consumer' || requestType === 'wholesale') && typeof px.purchase === 'function') {
                px.purchase({
                    total_quantity: String(qty),
                    total_price: String(totalPrice),
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
    
    // GA4 begin_checkout / purchase
    if (ga4) {
        ga4('event', 'begin_checkout', {
            currency: 'KRW',
            value: totalPrice,
            items: [{
                item_id: productId,
                item_name: `파보겔 직영 주문 (${productId || '100ml'})`,
                item_category: '반려동물 보조사료',
                price: unitPrice,
                quantity: qty,
            }]
        });
        
        // Also fire purchase for direct orders
        if (requestType === 'consumer' || requestType === 'wholesale') {
            ga4('event', 'purchase', {
                transaction_id: `parvogel_${Date.now()}`,
                currency: 'KRW',
                value: totalPrice,
                items: [{
                    item_id: productId,
                    item_name: `파보겔 직영 주문 (${productId || '100ml'})`,
                    item_category: '반려동물 보조사료',
                    price: unitPrice,
                    quantity: qty,
                }]
            });
        }
    }
    
    // GTM
    pushGTM('form_submit', { form_id: `order_form_${requestType}`, form_type: requestType, success: true });
}

// New funnel tracking functions
export function trackVideoPlay(videoId, videoTitle, progress = 0) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'video_play', {
            video_id: videoId,
            video_title: videoTitle,
            video_progress: progress,
        });
    }
    pushGTM('video_play', { video_id: videoId, video_title: videoTitle, video_progress: progress });
    clarityEvent('video_play', { videoId, videoTitle, progress });
}

export function trackVideoProgress(videoId, videoTitle, progressPercent) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'video_progress', {
            video_id: videoId,
            video_title: videoTitle,
            video_percent: progressPercent,
        });
    }
    pushGTM('video_progress', { video_id: videoId, video_title: videoTitle, video_percent: progressPercent });
    if (progressPercent >= 25) clarityEvent('video_25', { videoId });
    if (progressPercent >= 50) clarityEvent('video_50', { videoId });
    if (progressPercent >= 75) clarityEvent('video_75', { videoId });
    if (progressPercent >= 100) clarityEvent('video_complete', { videoId });
}

export function trackCTAClick(ctaId, ctaLabel, ctaLocation, destination) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'cta_click', {
            cta_id: ctaId,
            cta_label: ctaLabel,
            cta_location: ctaLocation,
            destination: destination,
        });
    }
    pushGTM('cta_click', { cta_id: ctaId, cta_label: ctaLabel, cta_location: ctaLocation, destination: destination });
    clarityEvent('cta_click', { ctaId, ctaLabel, ctaLocation, destination });
}

export function trackScrollDepth(percent) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'scroll', {
            percent_scrolled: percent,
        });
    }
    pushGTM('scroll', { percent_scrolled: percent });
    if (percent >= 25) clarityEvent('scroll_25');
    if (percent >= 50) clarityEvent('scroll_50');
    if (percent >= 75) clarityEvent('scroll_75');
    if (percent >= 100) clarityEvent('scroll_100');
}

export function trackFormStart(formId, formType) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'form_start', {
            form_id: formId,
            form_type: formType,
        });
    }
    pushGTM('form_start', { form_id: formId, form_type: formType });
    clarityEvent('form_start', { formId, formType });
}

export function trackFormFieldFocus(formId, fieldName) {
    pushGTM('form_field_focus', { form_id: formId, field_name: fieldName });
    clarityEvent('form_field_focus', { formId, fieldName });
}

export function trackFormError(formId, fieldName, errorType) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'form_error', {
            form_id: formId,
            field_name: fieldName,
            error_type: errorType,
        });
    }
    pushGTM('form_error', { form_id: formId, field_name: fieldName, error_type: errorType });
    clarityEvent('form_error', { formId, fieldName, errorType });
}

export function trackSearch(query, resultsCount) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'search', {
            search_term: query,
            results_count: resultsCount,
        });
    }
    clarityEvent('search', { query, resultsCount });
}

export function trackBlogRead(postId, postTitle, readTime) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'blog_read', {
            post_id: postId,
            post_title: postTitle,
            engagement_time_msec: readTime,
        });
    }
    clarityEvent('blog_read', { postId, postTitle, readTime });
}

export function trackShare(platform, contentId, contentType) {
    const ga4 = getGA4();
    if (ga4) {
        ga4('event', 'share', {
            method: platform,
            content_id: contentId,
            content_type: contentType,
        });
    }
    clarityEvent('share', { platform, contentId, contentType });
}

const MALL_MATCHERS = [
    { match: 'coupang.com', key: 'coupang', platform: 'coupang' },
    { match: 'smartstore.naver.com', key: 'smartstore', platform: 'naver_blog' },
    { match: 'store.kakao.com', key: 'kakao_store', platform: 'kakao_channel' },
    { match: 'gmarket.co.kr', key: 'gmarket', platform: 'gmarket' },
    { match: 'auction.co.kr', key: 'auction', platform: 'auction' },
    { match: '11st.co.kr', key: '11st', platform: '11st' },
    { match: 'toss.shopping', key: 'toss', platform: 'toss' },
];

function matchMall(href) {
    const lower = (href || '').toLowerCase();
    for (const { match, key, platform } of MALL_MATCHERS) {
        if (lower.includes(match)) return { key, platform };
    }
    return null;
}

/**
 * 외부몰 <a> 태그의 href에 추적 파라미터 부여 (이미 부여된 경우 그대로 반환).
 * 클릭/가운데클릭/길게누르기/우클릭 직전에 실행되어
 * 새 탭 열기, 링크 복사 등 모든 이동 경로에 파라미터가 포함됩니다.
 */
function decorateAnchor(anchor) {
    const href = anchor.getAttribute('href') || '';
    const matchResult = matchMall(href);
    if (!matchResult) return null;
    
    const { key: mallKey, platform: detectedPlatform } = matchResult;
    const platform = detectedPlatform || 'unknown';
    
    const decorated = decorateMallUrl(href, mallKey, getPlacement(anchor), platform);
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
        if (anchor) {
            const matchResult = matchMall(anchor.getAttribute('href') || '');
            if (matchResult) {
                decorateAnchor(anchor);
            }
        }
    };

    const handleClick = (e) => {
        const anchor = e.target?.closest?.('a[href]');
        if (!anchor) return;
        const href = anchor.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;

        const matchResult = matchMall(href);
        if (matchResult) {
            const { key: mallKey, platform } = matchResult;
            const productId = anchor.getAttribute('data-product-id') || 'parvogel-100ml';
            const placement = getPlacement(anchor);
            trackKakaoMallClick(mallKey, productId, placement, platform);
            return;
        }
        
        // 카카오 채널 채팅 링크 별도 처리
        if (href.toLowerCase().includes('pf.kakao.com')) {
            trackKakaoChannelChat();
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
