import verifiedData from '../data/verifiedBusinesses.json'
import sampleRecipients from '../data/sampleRecipients.json'
import findSampleRecipient from './sampleCheck.js'

export const VERIFICATION_STATUS = {
    ALREADY_RECEIVED: 'ALREADY_RECEIVED', // 기존 116곳 수령 완료 -> 도매 발주 모달 유도
    VERIFIED_TARGET: 'VERIFIED_TARGET',   // 1,400여 타깃 인허가 사업자 인증 완료 -> 샘플 발송 접수
    UNVERIFIED_PUBLIC: 'UNVERIFIED_PUBLIC' // 일반인/미등록 -> 친절 차단 모달 노출
}

/**
 * 전화번호를 정규화하여 010... 형태의 숫자 문자열로 만듭니다.
 */
export function normalizePhone(phone) {
    if (!phone) return ''
    let clean = String(phone).replace(/[^0-9]/g, '').trim()
    if (clean.startsWith('10') && clean.length === 10) {
        clean = '0' + clean
    }
    return clean
}

/**
 * 무료 샘플 신청자의 사업자 인증 상태를 3단계로 검증합니다.
 * @param {string} phone 
 * @param {string} shopName 
 * @param {string} bizNumber 
 * @returns {{ status: string, data?: object, message?: string }}
 */
export function verifyBusinessApplicant(phone, shopName = '', bizNumber = '') {
    const cleanPhone = normalizePhone(phone)

    // 1단계: 기존 116건 무료 샘플 수령자 여부 확인 (최우선)
    const alreadyReceived = findSampleRecipient(cleanPhone, shopName)
    if (alreadyReceived) {
        return {
            status: VERIFICATION_STATUS.ALREADY_RECEIVED,
            data: alreadyReceived,
            message: `${alreadyReceived.shopName || '대표'}님은 이미 1차 무료 샘플(등록 #${alreadyReceived.orderNum})을 수령하셨습니다.`
        }
    }

    // 2단계: 1,400여 알리고 발송 타깃 및 B2B 마스터 010 전화번호 대조
    if (cleanPhone && cleanPhone.length >= 10) {
        const phoneMatch = verifiedData.phones[cleanPhone]
        if (phoneMatch) {
            return {
                status: VERIFICATION_STATUS.VERIFIED_TARGET,
                data: {
                    phone: cleanPhone,
                    type: phoneMatch.type || 'verified_pet_business',
                    group: phoneMatch.group,
                    shopName: phoneMatch.shopName || shopName
                },
                message: '정부 인허가 동물판매업/생산업 등록 타깃 사업자로 인증되었습니다.'
            }
        }
    }

    // 3단계: 지자체 인허가 정상영업 펫샵 상호명 대조
    if (shopName) {
        const cleanShop = String(shopName).replace(/\s+/g, '').toLowerCase()
        if (cleanShop.length >= 3 && verifiedData.registeredShops.includes(cleanShop)) {
            return {
                status: VERIFICATION_STATUS.VERIFIED_TARGET,
                data: {
                    shopName,
                    type: 'registered_shop_name'
                },
                message: '지자체 인허가 정식 동물판매업 등록 상호로 인증되었습니다.'
            }
        }
    }

    // 4단계: 사업자등록번호 유효성 검증 (사업자번호 입력 시)
    if (bizNumber) {
        const cleanBiz = String(bizNumber).replace(/[^0-9]/g, '')
        if (cleanBiz.length === 10) {
            // 국세청 사업자등록번호 체크섬 검증 알고리즘
            const checkWeights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
            let sum = 0
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cleanBiz[i], 10) * checkWeights[i]
            }
            sum += Math.floor((parseInt(cleanBiz[8], 10) * 5) / 10)
            const remainder = (10 - (sum % 10)) % 10
            const isValidChecksum = remainder === parseInt(cleanBiz[9], 10)

            // 사업자등록번호가 유효하고 상호에 애견/펫/켄넬/브리더/동물 관련 키워드가 있는 경우
            const animalKeywords = ['펫', '독', '도그', '퍼피', '캣', '켄넬', '브리더', '애견', '동물', '묘', '견', '농장']
            const hasAnimalKeyword = animalKeywords.some(k => (shopName || '').includes(k))

            if (isValidChecksum && hasAnimalKeyword) {
                return {
                    status: VERIFICATION_STATUS.VERIFIED_TARGET,
                    data: {
                        bizNumber: cleanBiz,
                        shopName,
                        type: 'checksum_verified_business'
                    },
                    message: '정식 사업자등록번호 및 반려동물 전문 업종 확인 완료'
                }
            }
        }
    }

    // 5단계: 미등록 일반인 또는 일반 개인
    return {
        status: VERIFICATION_STATUS.UNVERIFIED_PUBLIC,
        message: '파보겔 무료 샘플은 정부 인허가 동물판매업·생산업 정식 사업자 전용 프로그램입니다.'
    }
}

export default verifyBusinessApplicant
