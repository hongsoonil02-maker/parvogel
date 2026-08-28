// 온라인 판매 채널 링크
// ⚠️ 상품 페이지 주소가 바뀌면 아래 productUrl만 교체하면 전체 사이트에 반영됩니다.
export const STORE_LINKS = {
    coupang: {
        productUrl: 'https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090',
        fallbackUrl: 'https://www.coupang.com',
    },
    naver: {
        productUrl: 'https://smartstore.naver.com/petschury/products/13718496355',
        fallbackUrl: 'https://shopping.naver.com',
    },
}

export const getStoreUrl = (store) =>
    STORE_LINKS[store]?.productUrl || STORE_LINKS[store]?.fallbackUrl || '#'
