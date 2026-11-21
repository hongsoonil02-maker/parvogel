import { useState } from 'react'
import { Play, Share2, Award, CheckCircle2, Tv, ExternalLink } from 'lucide-react'
import { OFFICIAL_STORES } from '../config/stores'

export default function PetTvShortsTab({
  shorts,
  todayKey,
  alreadyClaimedToday,
  busy,
  onClaimShortsReward,
}) {
  const [activeVideoId, setActiveVideoId] = useState(null)

  const handleShare = async (short) => {
    const shareUrl = short.youtube_url || `https://youtube.com/shorts/${short.video_id}`
    const shareText = `[파보겔 펫TV] ${short.title}\n${shareUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ title: short.title, text: short.title, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareText)
      }
    } catch {
      // user cancelled native share sheet; still allow copy fallback
    }
    if (!alreadyClaimedToday) {
      await onClaimShortsReward({
        videoId: short.video_id,
        action: 'share',
        pointsAwarded: Math.min(50, Math.max(10, Number(short.reward_points) || 50)),
      })
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* 상단 리워드 안내 배너 */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">
              <Tv className="h-3 w-3" /> FIREBASE 실시간 자동 연동
            </span>
            <h2 className="mt-1.5 text-lg font-extrabold">파보겔 펫TV (공식 쇼츠)</h2>
            <p className="mt-0.5 text-xs text-teal-100">
              쇼츠를 끝까지 보거나 공유하면 1일 1회 보너스 포인트(+50P)가 자동 적립됩니다!
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white/15 px-3 py-2">
            <Award className="h-5 w-5 text-amber-300" />
            <span className="mt-0.5 text-[10px] font-bold">
              {alreadyClaimedToday ? '오늘 적립완료' : '적립 가능'}
            </span>
          </div>
        </div>
      </section>

      {/* 쇼츠 세로형 카드 피드 */}
      {shorts.length === 0 ? (
        <div className="mint-card rounded-3xl p-8 text-center text-sm text-slate-500">
          실시간 파보겔 쇼츠 피드를 불러오는 중입니다...
        </div>
      ) : (
        <div className="space-y-4">
          {shorts.map((short) => {
            const isPlaying = activeVideoId === short.video_id
            const pts = Math.min(50, Math.max(10, Number(short.reward_points) || 50))
            return (
              <article key={short.video_id} className="mint-card overflow-hidden rounded-3xl">
                {/* 9:16 세로형 쇼츠 플레이어 / 썸네일 */}
                <div className="relative aspect-[9/14] w-full bg-slate-900">
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${short.video_id}?autoplay=1&rel=0&playsinline=1`}
                      title={short.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideoId(short.video_id)}
                      className="group relative flex h-full w-full items-center justify-center overflow-hidden"
                    >
                      <img
                        src={short.thumbnail_url || `https://i.ytimg.com/vi/${short.video_id}/hqdefault.jpg`}
                        alt={short.title}
                        className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20" />
                      <div className="absolute top-3 left-3 rounded-full bg-teal-500/90 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                        시청 리워드 +{pts}P
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-teal-700 shadow-xl transition group-hover:scale-110">
                        <Play className="ml-1 h-7 w-7 fill-teal-600" />
                      </div>
                      <div className="absolute right-4 bottom-4 left-4 text-left">
                        <div className="line-clamp-2 text-sm font-extrabold text-white drop-shadow">
                          {short.title}
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* 카드 하단 리워드 & 공유 액션 */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-800">{short.title}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy || alreadyClaimedToday}
                      onClick={() =>
                        onClaimShortsReward({
                          videoId: short.video_id,
                          action: 'watch',
                          pointsAwarded: pts,
                        })
                      }
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-emerald-100 disabled:text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {alreadyClaimedToday ? `오늘(${todayKey}) 적립 완료` : `시청 완료 +${pts}P 받기`}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleShare(short)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100"
                    >
                      <Share2 className="h-4 w-4" />
                      카톡/SNS 공유
                    </button>
                  </div>

                  {/* 공식 판매처 원클릭 구매 */}
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px]">
                    <span className="font-semibold text-slate-600">영상 속 비상 상비 보조사료 파보겔</span>
                    <a
                      href={OFFICIAL_STORES[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-extrabold text-teal-700"
                    >
                      쿠팡 바로가기 <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
