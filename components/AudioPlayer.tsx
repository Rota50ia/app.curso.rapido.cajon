
import React, { useState, useRef, useEffect } from 'react';
import { Track } from '../types';

const CajonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor" strokeWidth="12">
     <path d="M40 60 L130 55 L130 185 L40 195 Z" />
     <path d="M130 55 L175 45 L175 170 L130 185 Z" />
     <path d="M40 60 L85 50 L175 45 L130 55 Z" />
     <circle cx="85" cy="125" r="30" />
  </svg>
);

interface AudioPlayerProps {
  track: Track;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [track.url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const total = audioRef.current.duration;
      if (!isNaN(total)) setProgress((audioRef.current.currentTime / total) * 100);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08090d] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 pb-safe">
      <header className="p-4 border-b border-white/[0.05] flex justify-between items-center bg-[#0d0e13]/80 backdrop-blur-xl">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-500 active:text-white">
          <i className="fas fa-chevron-down text-lg"></i>
        </button>
        <div className="text-center flex-1 mx-4">
          <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest block">EM REPRODUÇÃO</span>
          <h2 className="text-xs font-bold text-white truncate uppercase italic">{track.name}</h2>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm flex flex-col gap-10">
          <div className="relative aspect-square rounded-[32px] md:rounded-[40px] bg-[#111218] border border-white/5 overflow-hidden flex items-center justify-center shadow-3xl">
            <CajonIcon className={`w-32 md:w-40 text-slate-800 transition-all duration-700 ${isPlaying ? 'scale-110 opacity-40' : 'scale-100 opacity-20'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 h-2/3 border border-cyan-500/10 rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          <div className="space-y-8 bg-[#111218] p-8 rounded-[32px] border border-white/[0.03]">
            <audio ref={audioRef} src={track.url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setIsPlaying(false)} />

            <div className="space-y-4">
              <div className="relative group h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-500 font-mono">
                <span className="text-white">{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span className="opacity-50">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-10">
                <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }} className="text-slate-500 active:text-white transition-all scale-125">
                  <i className="fas fa-undo-alt"></i>
                </button>
                <button onClick={togglePlay} className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all active:scale-90 ${isPlaying ? 'bg-white text-black' : 'bg-cyan-500 text-white shadow-cyan-500/20'}`}>
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
                </button>
                <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }} className="text-slate-500 active:text-white transition-all scale-125">
                  <i className="fas fa-redo-alt"></i>
                </button>
              </div>

              <div className="flex gap-2 w-full">
                {[0.75, 1.0, 1.25].map(rate => (
                  <button key={rate} onClick={() => setPlaybackRate(rate)} className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all ${playbackRate === rate ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-600 border-white/5'}`}>
                    {rate === 1.0 ? 'NORMAL' : `${rate}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
