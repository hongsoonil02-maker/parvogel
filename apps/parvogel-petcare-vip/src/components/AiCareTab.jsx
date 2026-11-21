import { useState } from 'react'
import { Bot, Sparkles, ExternalLink, MessageCircle, ShieldAlert, History } from 'lucide-react'
import { getParvogelCareAdvice } from '../services/geminiCare'
import { OFFICIAL_STORES, PARVOGEL_BRAND } from '../config/stores'

const SPECIES_OPTIONS = [
  { id: 'dog', label: '강아지' },
  { id: 'cat', label: '고양이' },
  { id: 'bird', label: '반려조' },
  { id: 'small', label: '소동물' },
]

const QUICK_CONDITIONS = [
  '갑자기 묽은 변/설사를 시작했어요',
  '새벽에 노란 위산 구토를 했어요',
  '사료 변경 후 장이 예민해졌어요',
  '예방 차원의 평소 장 컨디션 관리',
]

export default function AiCareTab({ consults, onSaveConsult }) {
  const [species, setSpecies] = useState('dog')
  const [weightKg, setWeightKg] = useState('4.2')
  const [ageText, setAgeText] = useState('2살')
  const [condition, setCondition] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!condition.trim()) return
    setLoading(true)
    try {
      const weightNum = Math.max(0.2, Math.min(120, Number(weightKg) || 3))
      const res = await getParvogelCareAdvice({
        species,
        weightKg: weightNum,
        ageText: ageText.trim() || '성견/성묘',
        condition: condition.trim(),
      })
      setResult(res)
      await onSaveConsult({
        petSpecies: species,
        weightKg: weightNum,
        ageText: ageText.trim() || '성견/성묘',
        condition: condition.trim(),
        aiAdvice: res.advice,
        recommendedPumps: res.recommendedPumps,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* 입력 카드 */}
      <section className="mint-card rounded-3xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800">파보겔 AI 케어 도우미</h2>
            <p className="text-xs text-slate-500">
              제미나이 AI가 우리 아이 체중·컨디션에 맞춘 적정 급여량을 안내해 드려요.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="mt-4 space-y-3">
          {/* 종류 선택 */}
          <div className="grid grid-cols-4 gap-1.5">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSpecies(opt.id)}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  species === opt.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-teal-50/70 text-teal-800 hover:bg-teal-100/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="text-[11px] font-bold text-slate-600">체중 (kg)</span>
              <input
                type="number"
                step="0.1"
                min="0.2"
                max="120"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-teal-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-slate-600">연령 (예: 4개월, 3살)</span>
              <input
                type="text"
                value={ageText}
                onChange={(e) => setAgeText(e.target.value)}
                maxLength={30}
                required
                className="mt-1 w-full rounded-xl border border-teal-100 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-teal-400"
              />
            </label>
          </div>

          {/* 빠른 증상 칩 */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CONDITIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCondition(chip)}
                className="rounded-full border border-teal-200 bg-teal-50/60 px-2.5 py-1 text-[11px] font-medium text-teal-800 transition hover:bg-teal-100"
              >
                + {chip}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-[11px] font-bold text-slate-600">현재 컨디션 / 고민 내용</span>
            <textarea
              rows={3}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              maxLength={450}
              placeholder="예) 어제 밤부터 묽은 변을 2번 보고 밥을 조금 덜 먹어요."
              className="mt-1 w-full resize-none rounded-xl border border-teal-100 bg-white p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading || !condition.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-teal-700/15 transition active:scale-[0.99] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? '제미나이 AI가 맞춤 가이드를 작성 중...' : '맞춤 급여량 & 케어 가이드 받기'}
          </button>
        </form>
      </section>

      {/* AI 응답 카드 */}
      {result && (
        <section className="mint-card rounded-3xl border-2 border-teal-200 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-extrabold text-teal-800">
              <Sparkles className="h-3 w-3" /> 맞춤 급여 가이드
            </span>
            <span className="text-[10px] font-medium text-slate-400">Powered by Gemini AI</span>
          </div>

          <div className="mt-3 rounded-2xl bg-teal-50 p-3">
            <div className="text-[11px] font-semibold text-teal-700">체중 기준 권장 급여량</div>
            <div className="mt-0.5 text-sm font-extrabold text-teal-900">{result.recommendedPumps}</div>
          </div>

          <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
            {result.advice}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-[11px] text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              파보겔은 정식 등록 보조사료입니다. 심한 혈변·반복 구토·기력 저하 등 응급 증상 시 반드시 동물병원 수의사 진료를 우선해 주세요.
            </span>
          </div>

          {/* 즉시 구매 CTA */}
          <div className="mt-4 border-t border-teal-100 pt-3.5">
            <div className="text-xs font-bold text-slate-800">공식 판매처에서 파보겔 바로 준비하기</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {OFFICIAL_STORES.slice(0, 3).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r ${s.color} py-2.5 text-[11px] font-bold text-white shadow-xs`}
                >
                  {s.id === 'coupang' ? '쿠팡' : s.id === 'naver' ? '스마트스토어' : 'G마켓'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
            <a
              href={PARVOGEL_BRAND.kakaoChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-2.5 text-xs font-extrabold text-[#3C1E1E]"
            >
              <MessageCircle className="h-4 w-4" /> 파보겔 공식 카카오톡 1:1 상담
            </a>
          </div>
        </section>
      )}

      {/* 최근 AI 상담 이력 */}
      {consults.length > 0 && (
        <section className="mint-card rounded-3xl p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <History className="h-4 w-4 text-teal-600" /> 내 최근 AI 케어 기록
          </h3>
          <div className="mt-2.5 space-y-2.5">
            {consults.slice(0, 4).map((c) => (
              <details
                key={c.id}
                className="rounded-2xl border border-teal-100 bg-teal-50/35 px-3.5 py-2.5 text-xs"
              >
                <summary className="cursor-pointer font-bold text-slate-700">
                  [{c.weightKg}kg / {c.ageText}] {c.condition.slice(0, 36)}
                </summary>
                <div className="mt-2 whitespace-pre-wrap border-t border-teal-100 pt-2 text-[11px] leading-relaxed text-slate-600">
                  {c.aiAdvice}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
