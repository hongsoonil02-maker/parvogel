import { ExternalLink, Phone, MessageCircle, ShieldCheck } from 'lucide-react'
import { OFFICIAL_STORES, PARVOGEL_BRAND } from '../config/stores'

export default function ShopTab() {
  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-600 p-5 text-white shadow-md">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold">
          <ShieldCheck className="h-3.5 w-3.5" /> (주)한국아그로 정품 공식 판매처
        </span>
        <h2 className="mt-2 text-lg font-extrabold">파보겔(ParvoGel) 원터치 펌프 겔</h2>
        <p className="mt-1 text-xs leading-relaxed text-teal-50">
          체내 흡수율 0% 고순도 나노 몬모릴로나이트 + 1-DNJ + 비타민 B12 전해질 배합.
          주사기 없이 1초 원터치 펌프로 간편하게 급여하는 반려동물 장 점막 보호 보조사료입니다.
        </p>
      </section>

      <section className="space-y-2.5">
        {OFFICIAL_STORES.map((store) => (
          <a
            key={store.id}
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mint-card flex items-center justify-between rounded-2xl p-4 transition active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-800">{store.name}</span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  {store.badge}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">정품 인증 · 구매 후 앱에서 스탬프 적립 가능</div>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${store.color} text-white`}>
              <ExternalLink className="h-4 w-4" />
            </div>
          </a>
        ))}
      </section>

      <section className="mint-card rounded-3xl p-4 text-xs text-slate-600">
        <div className="font-bold text-slate-800">공식 고객센터 & 브랜드 안내</div>
        <div className="mt-2 space-y-1.5">
          <div>상호: {PARVOGEL_BRAND.company}</div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-teal-600" /> 대표전화: {PARVOGEL_BRAND.phone}
          </div>
          <a
            href={PARVOGEL_BRAND.kakaoChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-2.5 font-extrabold text-[#3C1E1E]"
          >
            <MessageCircle className="h-4 w-4" /> 카카오톡 공식 채널 1:1 문의
          </a>
        </div>
      </section>
    </div>
  )
}
