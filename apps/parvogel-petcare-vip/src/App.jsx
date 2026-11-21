import { useEffect, useState, useMemo } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'
import {
  Award,
  Bot,
  Tv,
  ShoppingBag,
  LogOut,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react'
import { auth, db, googleProvider } from './firebase'
import { PARVOGEL_BRAND } from './config/stores'
import StampCardTab from './components/StampCardTab'
import AiCareTab from './components/AiCareTab'
import PetTvShortsTab from './components/PetTvShortsTab'
import ShopTab from './components/ShopTab'

function getTodayKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function generateCouponCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let rand = ''
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)]
  }
  return `PVG-VIP-${rand}`
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState(null)
  const [stampLogs, setStampLogs] = useState([])
  const [coupons, setCoupons] = useState([])
  const [consults, setConsults] = useState([])
  const [shorts, setShorts] = useState([])
  const [activeTab, setActiveTab] = useState('stamp')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [authError, setAuthError] = useState('')

  const todayKey = useMemo(() => getTodayKey(), [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  // 1. Auth State Observer & User Document Bootstrap
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: fbUser.uid,
            displayName: (fbUser.displayName || '파보겔 VIP 보호자').slice(0, 60),
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            role: 'member',
            stamps: 0,
            totalStampsEarned: 0,
            points: 0,
            coupons: 0,
            lastCheckinDate: '',
            lastShortsRewardDate: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }
      } else {
        setProfile(null)
        setStampLogs([])
        setCoupons([])
        setConsults([])
        setShorts([])
      }
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  // 2. Realtime Listeners (Profile, Stamp Logs, Coupons, Care Consults, Shorts Feed)
  useEffect(() => {
    if (!user) return

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data())
    })

    const unsubLogs = onSnapshot(
      query(collection(db, 'users', user.uid, 'stamp_logs'), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => setStampLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    const unsubCoupons = onSnapshot(
      query(collection(db, 'users', user.uid, 'coupons'), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    const unsubConsults = onSnapshot(
      query(collection(db, 'users', user.uid, 'care_consults'), orderBy('createdAt', 'desc'), limit(10)),
      (snap) => setConsults(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    const unsubShorts = onSnapshot(
      query(
        collection(db, 'shorts_feed'),
        where('product_tag', '==', 'parvogel'),
        orderBy('created_at', 'desc'),
        limit(20)
      ),
      (snap) => setShorts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )

    return () => {
      unsubProfile()
      unsubLogs()
      unsubCoupons()
      unsubConsults()
      unsubShorts()
    }
  }, [user])

  // Login Handlers
  const handleGoogleLogin = async () => {
    setAuthError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setAuthError(`구글 로그인 실패: ${err.message}`)
    }
  }

  const handleGuestLogin = async () => {
    setAuthError('')
    try {
      await signInAnonymously(auth)
      showToast('게스트 모드로 체험 로그인되었습니다.')
    } catch (err) {
      setAuthError(`로그인 오류: ${err.message}`)
    }
  }

  // Daily Feeding Check-in (+1 Stamp)
  const handleDailyCheckin = async () => {
    if (!user || !profile || profile.lastCheckinDate === todayKey || profile.stamps >= 10) return
    setBusy(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        const cur = snap.data()
        if (cur.lastCheckinDate === todayKey || cur.stamps >= 10) return
        tx.update(userRef, {
          stamps: cur.stamps + 1,
          totalStampsEarned: cur.totalStampsEarned + 1,
          lastCheckinDate: todayKey,
          updatedAt: serverTimestamp(),
        })
      })
      await addDoc(collection(db, 'users', user.uid, 'stamp_logs'), {
        uid: user.uid,
        type: 'daily_checkin',
        deltaStamps: 1,
        note: '오늘 파보겔 일일 급여 체크 완료',
        market: 'app',
        dateKey: todayKey,
        createdAt: serverTimestamp(),
      })
      showToast('🎉 오늘의 급여 체크 완료! VIP 스탬프 +1 적립')
    } catch (err) {
      showToast(`적립 오류: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  // Purchase Verify (+1 Stamp)
  const handlePurchaseVerify = async ({ market, orderRef }) => {
    if (!user || !profile || profile.stamps >= 10) return
    setBusy(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        const cur = snap.data()
        if (cur.stamps >= 10) return
        tx.update(userRef, {
          stamps: cur.stamps + 1,
          totalStampsEarned: cur.totalStampsEarned + 1,
          updatedAt: serverTimestamp(),
        })
      })
      await addDoc(collection(db, 'users', user.uid, 'stamp_logs'), {
        uid: user.uid,
        type: 'purchase_verify',
        deltaStamps: 1,
        note: `공식몰 구매 인증 (${market.toUpperCase()} / ${orderRef})`,
        market,
        orderRef,
        dateKey: todayKey,
        createdAt: serverTimestamp(),
      })
      showToast('✅ 구매 인증이 완료되어 스탬프 +1이 적립되었습니다!')
    } catch (err) {
      showToast(`구매 인증 오류: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  // Convert 100P -> +1 Stamp
  const handleConvertPointsToStamp = async () => {
    if (!user || !profile || profile.points < 100 || profile.stamps >= 10) return
    setBusy(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        const cur = snap.data()
        if (cur.points < 100 || cur.stamps >= 10) return
        tx.update(userRef, {
          points: cur.points - 100,
          stamps: cur.stamps + 1,
          totalStampsEarned: cur.totalStampsEarned + 1,
          updatedAt: serverTimestamp(),
        })
      })
      await addDoc(collection(db, 'users', user.uid, 'stamp_logs'), {
        uid: user.uid,
        type: 'point_convert',
        deltaStamps: 1,
        note: '펫TV 보너스 100P → 스탬프 1개 전환',
        market: 'app',
        dateKey: todayKey,
        createdAt: serverTimestamp(),
      })
      showToast('✨ 100P를 VIP 스탬프 +1개로 전환했습니다!')
    } catch (err) {
      showToast(`전환 오류: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  // Redeem 10 Stamps -> VIP Repurchase Coupon
  const handleRedeemCoupon = async () => {
    if (!user || !profile || profile.stamps < 10) return
    setBusy(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const code = generateCouponCode()
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef)
        const cur = snap.data()
        if (cur.stamps < 10) return
        tx.update(userRef, {
          stamps: 0,
          coupons: cur.coupons + 1,
          updatedAt: serverTimestamp(),
        })
      })
      await addDoc(collection(db, 'users', user.uid, 'coupons'), {
        uid: user.uid,
        code,
        discountLabel: '파보겔 VIP 재구매 15% 할인 쿠폰',
        status: 'active',
        createdAt: serverTimestamp(),
      })
      await addDoc(collection(db, 'users', user.uid, 'stamp_logs'), {
        uid: user.uid,
        type: 'coupon_redeem',
        deltaStamps: -10,
        note: `스탬프 10칸 완성 → 할인 쿠폰(${code}) 교환`,
        market: 'app',
        dateKey: todayKey,
        createdAt: serverTimestamp(),
      })
      showToast(`🎁 쿠폰 발급 완료! 코드: ${code}`)
    } catch (err) {
      showToast(`쿠폰 교환 오류: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  // Claim Daily Shorts Reward (+50P, 1 per day enforced by docId == todayKey)
  const handleClaimShortsReward = async ({ videoId, action, pointsAwarded }) => {
    if (!user || !profile) return
    if (profile.lastShortsRewardDate === todayKey) {
      showToast('오늘의 펫TV 보너스 포인트는 이미 적립되었습니다!')
      return
    }
    setBusy(true)
    try {
      const rewardRef = doc(db, 'users', user.uid, 'shorts_rewards', todayKey)
      const existing = await getDoc(rewardRef)
      if (existing.exists()) {
        showToast('오늘의 펫TV 보너스 포인트는 이미 적립되었습니다!')
        return
      }
      await setDoc(rewardRef, {
        uid: user.uid,
        videoId,
        action,
        pointsAwarded,
        dateKey: todayKey,
        createdAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', user.uid), {
        points: (profile.points || 0) + pointsAwarded,
        lastShortsRewardDate: todayKey,
        updatedAt: serverTimestamp(),
      })
      showToast(`🎬 펫TV ${action === 'share' ? '공유' : '시청'} 리워드 +${pointsAwarded}P 적립 완료!`)
    } catch (err) {
      showToast(`포인트 적립 오류: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  // Save AI Care Consult to Firestore
  const handleSaveConsult = async (payload) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'care_consults'), {
      uid: user.uid,
      ...payload,
      createdAt: serverTimestamp(),
    })
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2FBF8]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <p className="mt-3 text-xs font-semibold text-teal-700">파보겔 펫케어 VIP 로딩 중...</p>
        </div>
      </div>
    )
  }

  // Login Gate Screen
  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between bg-gradient-to-b from-[#E6FAF4] via-[#F5FDFB] to-white px-6 py-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-extrabold text-teal-800">
            <ShieldCheck className="h-3.5 w-3.5" /> {PARVOGEL_BRAND.company} 공식 보호자 앱
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">
            파보겔 <span className="text-teal-600">펫케어 VIP</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            우리 아이 장 건강 급여 체크, 10칸 VIP 스탬프 쿠폰, 제미나이 AI 맞춤 급여 도우미, 그리고 파보겔 펫TV 쇼츠 리워드까지 한곳에서 누리세요.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Award, title: '10칸 디지털 스탬프 & 재구매 쿠폰', desc: '매일 급여 체크와 구매 인증으로 할인 혜택 적립' },
              { icon: Bot, title: '제미나이 AI 파보겔 케어 도우미', desc: '체중·연령·컨디션별 적정 펌프 급여량 즉시 안내' },
              { icon: Tv, title: '파보겔 펫TV 실시간 쇼츠 리워드', desc: '공식 쇼츠 시청·공유 시 매일 보너스 포인트 자동 적립' },
            ].map((item) => (
              <div key={item.title} className="mint-card flex items-center gap-3.5 rounded-2xl p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-2.5">
          {authError && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-teal-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-teal-700/20 transition active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" /> Google 계정으로 3초 시작하기
          </button>
          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white py-3.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50"
          >
            <HeartHandshake className="h-4 w-4" /> 둘러보기 (체험 계정 로그인)
          </button>
          <p className="pt-2 text-center text-[11px] text-slate-400">
            {PARVOGEL_BRAND.company} | 대표전화 {PARVOGEL_BRAND.phone} | parvogel.kr
          </p>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'stamp', label: 'VIP 스탬프', icon: Award },
    { id: 'ai', label: 'AI 케어', icon: Bot },
    { id: 'shorts', label: '펫TV 쇼츠', icon: Tv },
    { id: 'shop', label: '공식몰', icon: ShoppingBag },
  ]

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F2FBF8] pb-24">
      {/* 상단 앱 바 */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-teal-100 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-teal-700">ParvoGel</span>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold text-teal-700">
              VIP
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {profile?.displayName || '파보겔 VIP 보호자'}님 환영해요
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-3.5 w-3.5" /> 로그아웃
        </button>
      </header>

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed top-16 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-slate-900/95 px-4 py-3 text-center text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="px-4 pt-4">
        {activeTab === 'stamp' && (
          <StampCardTab
            profile={profile}
            stampLogs={stampLogs}
            coupons={coupons}
            todayKey={todayKey}
            busy={busy}
            onDailyCheckin={handleDailyCheckin}
            onPurchaseVerify={handlePurchaseVerify}
            onConvertPointsToStamp={handleConvertPointsToStamp}
            onRedeemCoupon={handleRedeemCoupon}
          />
        )}
        {activeTab === 'ai' && (
          <AiCareTab consults={consults} onSaveConsult={handleSaveConsult} />
        )}
        {activeTab === 'shorts' && (
          <PetTvShortsTab
            shorts={shorts}
            todayKey={todayKey}
            alreadyClaimedToday={profile?.lastShortsRewardDate === todayKey}
            busy={busy}
            onClaimShortsReward={handleClaimShortsReward}
          />
        )}
        {activeTab === 'shop' && <ShopTab />}
      </main>

      {/* 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-teal-100 bg-white/95 px-2 py-2 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center rounded-2xl py-1.5 transition ${
                  active ? 'bg-teal-50 text-teal-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="mt-0.5 text-[10px] font-bold">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
