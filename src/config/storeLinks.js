// 온라인 판매 채널 링크
// ⚠️ 쿠팡/네이버 스마트스토어 입점 완료 후 아래 URL을 실제 상품 페이지 주소로 교체하세요.
// 교체 후 hasProductUrl을 true로 바꾸면 "입점 예정" 뱃지가 자동으로 사라집니다.
export const STORE_LINKS = {
    coupang: {
        productUrl: '', // 예: 'https://www.coupang.com/vp/products/XXXXXXXX'
        fallbackUrl: 'https://www.coupang.com',
    },
    naver: {
        productUrl: '', // 예: 'https://smartstore.naver.com/스토어명/products/XXXXXXX'
        fallbackUrl: 'https://shopping.naver.com',
    },
}

export const getStoreUrl = (store) =>
    STORE_LINKS[store]?.productUrl || STORE_LINKS[store]?.fallbackUrl || '#'

export const hasProductUrl = Boolean(
    STORE_LINKS.coupang.productUrl && STORE_LINKS.naver.productUrl
)
