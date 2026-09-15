import sampleRecipients from '../data/sampleRecipients.json'

/**
 * 전화번호 또는 상호명으로 기존 무료 샘플 발송 완료 거래처 여부를 확인합니다.
 * @param {string} phone 
 * @param {string} shopName 
 * @returns {object|null} 일치하는 신청자 정보 또는 null
 */
export function findSampleRecipient(phone, shopName) {
    if (!phone && !shopName) return null

    // 1. 전화번호 정제 (숫자만 추출)
    let cleanPhone = String(phone || '').replace(/[^0-9]/g, '').trim()
    if (cleanPhone.startsWith('10') && cleanPhone.length === 10) {
        cleanPhone = '0' + cleanPhone
    }

    if (cleanPhone.length >= 9) {
        const found = sampleRecipients.find(r => {
            const rPhone = String(r.phone || '').replace(/[^0-9]/g, '')
            return rPhone === cleanPhone
        })
        if (found) return found
    }

    // 2. 상호명 엄격 일치 확인 (공백 제거 후 3글자 이상 완전 일치)
    if (shopName) {
        const cleanShop = String(shopName).replace(/\s+/g, '').toLowerCase()
        if (cleanShop.length >= 3 && !['애견샵', '펫샵', '동물병원'].includes(cleanShop)) {
            const found = sampleRecipients.find(r => {
                const rShop = String(r.shopName || '').replace(/\s+/g, '').toLowerCase()
                return rShop === cleanShop
            })
            if (found) return found
        }
    }

    return null
}

export default findSampleRecipient
