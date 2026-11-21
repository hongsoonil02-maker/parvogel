import { useState } from 'react'
import {
  CheckCircle2,
  Gift,
  ShoppingBag,
  Sparkles,
  Ticket,
  Coins,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { OFFICIAL_STORES, PURCHASE_MARKET_OPTIONS } from '../config/stores'

export default function StampCardTab({
  profile,
  stampLogs,
  coupons,
  todayKey,
  busy,
  onDailyCheckin,
  onPurchaseVerify,
  onConvertPointsToStamp,
  onRedeemCoupon,
}) {
  const [market, setMarket] = useState('coupang')
  const [orderRef, setOrderRef] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  const stamps = profile?.stamps ?? 0
  const points = profile?.points ?? 0
  const checkedInToday = profile?.lastCheckinDate === todayKey

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault()
    if (!orderRef.trim()) return
    await onPurchaseVerify({ market, orderRef: orderRef.trim() })
    setOrderRef('')
  }

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* 10칸 VIP 디지털 스탬프 카드 */}
      <section className="rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-5 text-white shadow-lg shadow-teal-900/15">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-teal-50">
              <Sparkles className="h-3 w-3" /> PARVOGEL VIP STAMP CARD
            </span>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight">
              스탬프 {stamps} / 10개 적립
            </h2>
            <p className="mt-0.5 text-xs text-teal-100">
              10칸을 모두 채우면 재구매 VIP 할인 쿠폰으로 즉시 교환됩니다.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
            <div className="text-[10px] text-teal-100">보유 펫포인트</div>
            <div className="text-base font-extrabold">{points.toLocaleString()} P</div>
          </div>
        </div>

        {/* 10칸 그리드 */}
        <div className="mt-4 grid grid-cols-5 gap-2.5 rounded-2xl bg-white/12 p-3.5 backdrop-blur-sm">
          {Array.from({ length: 10 }, (_, idx) => {
            const filled = idx < stamps
            const isGiftSlot = idx === 9
            return (
              <div
                key={idx}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all ${
                  filled
                    ? 'stamp-pop border-mint-200 bg-white text-teal-700 shadow-md'
                    : 'border-white/25 bg-white/10 text-teal-100/80'
                }`}
              >
                {filled ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <span className="mt-0.5 text-[10px] font-bold">완료</span>
                  </>
                ) : isGiftSlot ? (
                  <>
                    <Gift className="h-5 w-5 text-amber-200" />
                    <span className="mt-0.5 text-[10px] font-bold text-amber-100">쿠폰</span>
                  </>
                ) : (
                  <span className="text-sm font-bold">{idx + 1}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* 주요 액션 버튼 */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busy || checkedInToday || stamps >= 10}
            onClick={onDailyCheckin}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-bold text-teal-700 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            {checkedInToday ? '오늘 급여 체크 완료' : '매일 급여 체크 (+1)'}
          </button>

          {stamps >= 10 ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRedeemCoupon}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-300 py-3 text-sm font-extrabold text-amber-950 shadow-sm transition active:scale-[0.98]"
            >
              <Ticket className="h-4 w-4" />
              할인 쿠폰 교환하기!
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || points < 100 || stamps >= 10}
              onClick={onConvertPointsToStamp}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-teal-900/40 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Coins className="h-4 w-4 text-amber-300" />
              100P → 스탬프 전환
            </button>
          )}
        </div>
      </section>

      {/* 구매 인증 스탬프 적립 */}
      <section className="mint-card rounded-3xl p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">파보겔 공식 구매 인증</h3>
            <p className="text-xs text-slate-500">
              쿠팡·스마트스토어·G마켓 주문번호를 등록하면 스탬프가 적립됩니다.
            </p>
          </div>
        </div>

        <form onSubmit={handlePurchaseSubmit} className="mt-3.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-400"
            >
              {PURCHASE_MARKET_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="주문번호 뒤 6자리 이상 입력"
              maxLength={40}
              className="col-span-2 rounded-xl border border-teal-100 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400"
            />
          </div>
          <button
            type="submit"
            disabled={busy || orderRef.trim().length < 4 || stamps >= 10}
            className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stamps >= 10 ? '스탬프가 가득 찼습니다! 먼저 쿠폰을 교환하세요' : '구매 인증하고 스탬프 +1 적립'}
          </button>
        </form>
      </section>

      {/* 보유 재구매 할인 쿠폰 */}
      <section className="mint-card rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <Ticket className="h-4 w-4 text-teal-600" /> 내 VIP 재구매 쿠폰 ({coupons.length})
          </h3>
          <span className="text-[11px] font-medium text-teal-600">공식몰 사용 가능</span>
        </div>

        {coupons.length === 0 ? (
          <p className="mt-2.5 rounded-2xl bg-teal-50/50 p-3.5 text-center text-xs text-slate-500">
            스탬프 10개를 채우면 파보겔 재구매 VIP 할인 쿠폰이 이곳에 자동 발급됩니다.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-dashed border-teal-300 bg-teal-50/50 px-3.5 py-3"
              >
                <div>
                  <div className="text-xs font-extrabold text-teal-800">{c.discountLabel}</div>
                  <div className="mt-0.5 font-mono text-xs font-bold tracking-wider text-slate-600">
                    {c.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyCoupon(c.code)}
                  className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-bold text-teal-700 shadow-xs ring-1 ring-teal-200"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> 복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> 코드복사
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 공식 온라인 마켓 바로가기 */}
      <section className="mint-card rounded-3xl p-4">
        <h3 className="text-sm font-bold text-slate-800">파보겔 공식 판매처 바로 구매</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {OFFICIAL_STORES.slice(0, 3).map((store) => (
            <a
              key={store.id}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col justify-between rounded-2xl bg-gradient-to-br ${store.color} p-3 text-white shadow-sm transition active:scale-[0.98]`}
            >
              <span className="text-[10px] font-medium opacity-90">{store.badge}</span>
              <span className="mt-2 flex items-center justify-between text-xs font-extrabold">
                {store.name.replace(' 공식몰', '').replace(' 공식판매처', '')}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 최근 적립 히스토리 */}
      <section className="mint-card rounded-3xl p-4">
        <h3 className="text-sm font-bold text-slate-800">최근 스탬프 적립 기록</h3>
        {stampLogs.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">아직 기록이 없습니다. 오늘 첫 급여 체크를 눌러보세요!</p>
        ) : (
          <ul className="mt-2.5 divide-y divide-teal-50">
            {stampLogs.slice(0, 8).map((log) => (
              <li key={log.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <div className="font-semibold text-slate-700">{log.note}</div>
                  <div className="text-[11px] text-slate-400">{log.dateKey}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    log.deltaStamps >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {log.deltaStamps > 0 ? `+${log.deltaStamps} 스탬프` : `${log.deltaStamps} 교환`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
