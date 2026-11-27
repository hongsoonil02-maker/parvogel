const GEMINI_API_KEY =
  import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || ''
const MODEL_CANDIDATES = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash']

export function calculateBasePumps(weightKg, species = 'dog') {
  if (species === 'bird') {
    return {
      pumps: '0.1~0.3mL (부리 끝 1~2방울)',
      frequency: '하루 2~3회 (급성 시 2시간 간격 소량)',
      note: '부리 옆에 살짝 묻혀 스스로 삼키게 해주세요.',
    }
  }
  const w = Number(weightKg) || 3
  if (w < 1.5) {
    return {
      pumps: '1회 0.5~1펌프 (약 0.5~1mL)',
      frequency: '하루 3~4회 (소량씩 자주)',
      note: '신생아·초소형은 1펌프(1mL) 이하로 잇몸·혀에 살짝 묻혀 자주 급여할수록 예후가 좋습니다.',
    }
  }
  if (w <= 5) {
    return {
      pumps: '1회 1~2펌프 (약 1~2mL)',
      frequency: '하루 2~3회 (급성 시 2~3시간 간격)',
      note: '1펌프 = 약 1mL입니다. 구토/설사가 잦을 때는 한 번에 많이보다 나누어 자주 급여하세요.',
    }
  }
  if (w <= 10) {
    return {
      pumps: '1회 2~3펌프 (약 2~3mL)',
      frequency: '하루 2~3회',
      note: '체내 흡수 없이 장점막을 물리적으로 코팅해 배출하므로 간·신장 부담이 적습니다.',
    }
  }
  if (w <= 20) {
    return {
      pumps: '1회 3~5펌프 (약 3~5mL)',
      frequency: '하루 2~3회',
      note: '다른 경구 처방약과 함께 먹일 때는 1~2시간 간격을 두세요.',
    }
  }
  return {
    pumps: '1회 5~7펌프 (약 5~7mL)',
    frequency: '하루 2~3회',
    note: '대형견도 체중에 맞춰 펌프 수만 늘려 안전하게 급여할 수 있습니다.',
  }
}

export async function getParvogelCareAdvice({ species, weightKg, ageText, condition }) {
  const speciesKr =
    species === 'dog' ? '강아지' :
    species === 'cat' ? '고양이' :
    species === 'bird' ? '반려조' : '소동물'

  const calc = calculateBasePumps(weightKg, species)
  const basePumps = `${calc.pumps}, ${calc.frequency}`

  const systemPrompt = `당신은 (주)한국아그로 공식 반려동물 보조사료 '파보겔(ParvoGel)'의 다정한 AI 펫케어 도우미입니다.
반드시 아래 규칙을 지키세요:
1. 보호자 눈높이에 맞춰 따뜻하고 친근하게 답변하세요.
2. 파보겔은 정식 등록 보조사료(1초 원터치 펌프, 고순도 초미세 몬모릴로나이트·1-DNJ·전해질·비타민 B12 배합)이며 의약품이 아닙니다.
3. "몬모릴로나이트"로 정확히 표기하고, 체내 흡수 없이 유해 독소·바이러스만 자석처럼 흡착해 배출하는 장점막 물리적 코팅 원리를 쉽게 설명하세요.
4. 구토, 혈변, 심한 무기력, 경련 등 응급 징후가 언급되면 반드시 가까운 동물병원 수의사 진료를 최우선으로 안내하세요.
5. B2C 일반 보호자에게 '무료 샘플'이나 타사/병원 브랜드명을 절대 언급하지 마세요.
6. 한국어로 4개의 짧은 섹션(① 추천 급여량, ② 급여 팁, ③ 오늘의 케어 체크, ④ 수의사 진료 권장 기준)으로 깔끔하게 작성하세요.`

  const userPrompt = `반려동물 정보:
- 종류: ${speciesKr}
- 체중: ${weightKg}kg
- 연령: ${ageText}
- 현재 컨디션/증상: ${condition}
- 체중 기준 기본 참고치: ${basePumps}

위 정보를 바탕으로 파보겔 적정 급여 가이드와 따뜻한 일상 케어 팁을 작성해 주세요.`

  if (!GEMINI_API_KEY) {
    return {
      recommendedPumps: basePumps,
      advice: buildFallbackAdvice(speciesKr, weightKg, ageText, condition, basePumps),
      source: 'local-guide',
    }
  }

  for (const model of MODEL_CANDIDATES) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 1024,
            },
          }),
        }
      )
      if (!resp.ok) continue
      const data = await resp.json()
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n').trim()
      if (text) {
        return {
          recommendedPumps: basePumps,
          advice: text,
          source: model,
        }
      }
    } catch {
      // try next candidate
    }
  }

  return {
    recommendedPumps: basePumps,
    advice: buildFallbackAdvice(speciesKr, weightKg, ageText, condition, basePumps),
    source: 'fallback-guide',
  }
}

function buildFallbackAdvice(speciesKr, weightKg, ageText, condition, basePumps) {
  return `① 추천 급여량 (${speciesKr} ${weightKg}kg / ${ageText})
• 권장 기준: ${basePumps}
• 1초 원터치 펌프로 입가에 살짝 짜주거나 사료·간식에 섞어 급여해 주세요.

② 파보겔 급여 꿀팁
• 공복 구토나 묽은 변이 보일 때는 소량씩 나누어 급여하면 위장 부담이 적습니다.
• 고순도 나노 몬모릴로나이트가 체내 흡수 없이 장점막을 부드럽게 감싸 유해 물질 배출을 돕습니다.
• 다른 경구 의약품을 복용 중이라면 1~2시간 간격을 두고 급여해 주세요.

③ 오늘의 케어 체크 ("${condition}")
• 탈수 예방을 위해 미지근한 물을 조금씩 자주 급여해 주세요.
• 6~12시간 동안 변 상태와 식욕, 활력을 메모해 두시면 회복 경과 확인에 큰 도움이 됩니다.

④ 동물병원 진료 권장 기준
• 혈변, 반복적인 구토, 극심한 무기력, 체온 저하가 동반되면 지체 없이 가까운 동물병원 수의사 진료를 받아주세요. (제품 문의: (주)한국아그로 02-6949-5708)`
}
