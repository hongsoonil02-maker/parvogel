const fs = require('fs');
const p = 'src/locales/ko/translation.json';
const o = JSON.parse(fs.readFileSync(p, 'utf8'));

o.testimonials = {
    badge: '현장의 목소리',
    title: '수의사·약사·축주가 증명한 제품력',
    subtitle: '전국 200여 개 동물병원·약국·농가에서 파보겔의 효과를 검증했습니다',
    t1Name: '김 원장',
    t1Clinic: 'OO동물병원 (경기)',
    t1Role: '20년 경력 소 임상 전문',
    t1Content: '매 송아지 설사철마다 파보겔을 처방하는데, 24시간 내 설사 멈추고 활력 회복되는 경우가 90% 이상입니다. 농가 만족도가 가장 높습니다.',
    t2Name: '박 원장',
    t2Clinic: 'OO축산동물병원 (충남)',
    t2Role: '돼지·소 임상 전문',
    t2Content: 'PED 걸린 농가에 파보겔 500ml 응급 투여하니 폐사율이 40%에서 8%로 떨어졌습니다. 상온 보관 가능해 농가 비축 필수 추천입니다.',
    t3Name: '이 약사',
    t3Clinic: 'OO동물약국 (전북)',
    t3Role: '15년 동물약국 운영',
    t3Content: '쿠팡·네이버쇼핑 입점 후 재구매율 78%. 100ml 소포장은 초보 축주 구매 부담 낮추고, 500ml는 상주 농가 단골을 확보합니다.'
};

o.products = {
    badge: '제품 라인업',
    title: '용도에 맞는 맞춤 포장 단위',
    subtitle: '농장 규모와 목적에 맞춰 선택하세요. 전 품목 쿠팡 로켓배송·네이버쇼핑 당일발송',
    p1Name: '파보겔 100ml',
    p1Desc: '개별 투약용 / 초보 축주 추천',
    p1Price: '18,000원',
    p2Name: '파보겔 200ml',
    p2Desc: '중형 농장 / 경제적 선택',
    p2Price: '30,000원',
    p3Name: '파보겔 500ml',
    p3Desc: '대규모 농장 / 도매 공급',
    p3Price: '75,000원',
    recommended: '추천',
    order: '주문하기',
    inquiry: '문의하기',
    bulk: '대량 구매(10병 이상) 및 도매 문의는 별도 상담해 주세요.',
    bulkCta: '도매·대량 구매 상담'
};

fs.writeFileSync(p, JSON.stringify(o, null, 4) + '\n', 'utf8');
console.log('ko testimonials/products updated to Korean');
