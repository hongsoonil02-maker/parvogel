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
    gmarket: {
        productUrl: 'https://item.gmarket.co.kr/Item?goodscode=4876751217',
        fallbackUrl: 'https://www.gmarket.co.kr',
    },
    auction: {
        productUrl: 'https://itempage3.auction.co.kr/DetailView.aspx?itemno=F684977056',
        fallbackUrl: 'https://www.auction.co.kr',
    },
    elevenst: {
        productUrl: 'https://m.11st.co.kr/products/ma/9715355848',
        fallbackUrl: 'https://www.11st.co.kr',
    },
    kakaoStore: {
        productUrl: 'https://store.kakao.com/agrowellness/products/800840808',
        storeHomeUrl: 'https://store.kakao.com/agrowellness',
    },
    toss: {
        productUrl: 'https://toss.shopping/t/2713390059',
        fallbackUrl: 'https://toss.shopping/i/2724270331',
    },
    kakao: {
        channelChatUrl: 'https://pf.kakao.com/_rqxnJX/chat',
        channelHomeUrl: 'https://pf.kakao.com/_rqxnJX',
    },
}

export const getStoreUrl = (store) =>
    STORE_LINKS[store]?.productUrl || STORE_LINKS[store]?.fallbackUrl || '#'

export const getKakaoChannelUrl = () =>
    STORE_LINKS.kakao.channelChatUrl

export const VIP_APP_URL = 'https://parvogel-petcare-vip.web.app'

