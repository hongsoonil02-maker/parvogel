import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioTestimonial({ tKey = 'audioTestimonial', audioUrl }) {
  const { t } = useTranslation();
  const T = (key, fallback) => t(`${tKey}.${key}`, fallback);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  return (
    <section
      aria-label={T('title', '"송아지 설사 발병 시 파보겔 즉시 투여 반응"')}
      className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 my-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3.5 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200 inline-block">
            {T('tag', '🎙️ 현장 수의사 임상 녹음 인터뷰')}
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {T('title', '"송아지 설사 발병 시 파보겔 즉시 투여 반응"')}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {T('sub', '사랑동물병원 김동준 원장님 현장 반응 통화 녹음')}
          </p>
        </div>

        <div
          aria-live="polite"
          className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 w-full md:w-80 flex flex-col items-center gap-3 shadow-inner"
        >
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause audio interview' : 'Play audio interview'}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md transition-transform active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {T('docName', '김동준 원장 (사랑동물병원)')}
              </div>
              <div className="text-[10px] text-blue-700 font-bold">
                {T('docSub', '파보겔(로타겔) 임상 오디오 리포트')}
              </div>
              <div
                role="slider"
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                tabIndex={0}
                onClick={seek}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    const audio = audioRef.current;
                    if (audio && audio.duration) {
                      const step = 5;
                      audio.currentTime += e.key === 'ArrowRight' ? step : -step;
                    }
                  }
                }}
                className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden cursor-pointer"
              >
                <div className="h-full bg-blue-600" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 italic font-medium">
            {T('quote', '"파보겔 투여 후 설사 송아지의 장 점막 보호 및 기력 회복 속도가 매우 뛰어납니다."')}
          </p>
        </div>
      </div>
    </section>
  );
}
