// 온라인 판매 채널 링크
// ⚠️ 쿠팡/네이버 스마트스토어 입점 완료 후 아래 URL을 실제 상품 페이지 주소로 교체하세요.
// 교체 후 hasProductUrl을 true로 바꾸면 "입점 예정" 뱃지가 자동으로 사라집니다.
export const STORE_LINKS = {
    coupang: {
        productUrl: 'https://www.coupang.com/vp/products/9690739565?itemId=28983118193&vendorItemId=95912261090&q=%ED%8C%8C%EB%B3%B4%EA%B2%94&searchId=6c597ae758999&sourceType=search&itemsCount=60&searchRank=0&rank=0&traceId=mszhy782',
        fallbackUrl: 'https://www.coupang.com',
    },
    naver: {
        productUrl: 'https://smartstore.naver.com/petschury/products/13718496355?nl-query=%ED%8C%8C%EB%B3%B4%EA%B2%94&nl-ts-pid=joRi9sqos5wssRv2ord-313360',
        fallbackUrl: 'https://shopping.naver.com',
    },
}

export const getStoreUrl = (store) =>
    STORE_LINKS[store]?.productUrl || STORE_LINKS[store]?.fallbackUrl || '#'

export const hasProductUrl = Boolean(
    STORE_LINKS.coupang.productUrl && STORE_LINKS.naver.productUrl
)
