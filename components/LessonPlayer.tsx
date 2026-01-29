import React, { useState, useRef, useEffect } from 'react';
import { Lesson } from '../types';
import { supabase } from '../lib/supabase';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onClose, onComplete, userId }) => {
  const [completing, setCompleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [startTime] = useState(Date.now());
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        console.log("Interação requerida para áudio");
      });
    }
    return () => {
      savePracticeTime(false);
    };
  }, []);

  // Sincroniza a velocidade do áudio com o estado playbackRate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const savePracticeTime = async (isExplicit: boolean) => {
    const timeSpentMs = Date.now() - startTime;
    const minutesSpent = Math.max(0, Math.floor(timeSpentMs / 60000));
    
    if (minutesSpent > 0 && userId) {
      try {
        const { data: profile } = await supabase.from('profiles').select('tempo_pratica_minutos').eq('id', userId).single();
        if (profile) {
          await supabase.from('profiles').update({ 
            tempo_pratica_minutos: (profile.tempo_pratica_minutos || 0) + minutesSpent,
            updated_at: new Date().toISOString()
          }).eq('id', userId);
        }
      } catch (e) {
        if (isExplicit) console.error("Falha ao salvar prática:", e);
      }
    }
  };

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTo;
      setProgress(parseFloat(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    try {
      await savePracticeTime(true);
      
      const { data: profile } = await supabase.from('profiles').select('aulas_concluidas').eq('id', userId).single();
      if (profile) {
        await supabase.from('profiles').update({ 
          aulas_concluidas: (profile.aulas_concluidas || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('id', userId);
      }
      onComplete();
    } catch (err) {
      console.error("Erro Conclusão:", err);
      onComplete(); 
    } finally {
      setCompleting(false);
    }
  };

  const currentBpm = lesson.bpm ? Math.round(lesson.bpm * playbackRate) : null;
  // Calcula a duração de uma batida em segundos para a animação de pulso
  const pulseDuration = currentBpm ? 60 / currentBpm : 0.6;

  return (
    <div className="fixed inset-0 z-[100] bg-[#08090d] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
      <header className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-[#0d0e13]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-500 p-2 hover:text-white transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">{lesson.level}</span>
            <h2 className="text-sm font-bold text-white truncate max-w-[180px] md:max-w-none">{lesson.title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-white hover:bg-slate-700 transition-all">
          <i className="fas fa-times text-xs"></i>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto flex flex-col gap-8">
          
          <div 
            className={`relative aspect-square rounded-[40px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5 group ${isPlaying ? 'animate-pulse-bpm' : ''}`}
            style={{ '--bpm-duration': `${pulseDuration}s` } as React.CSSProperties}
          >
            <img 
              src={lesson.thumbnail} 
              alt={lesson.title} 
              className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            
            {currentBpm && (
              <div className="absolute top-6 right-6 bg-white text-black px-4 py-2 rounded-2xl shadow-2xl border border-white/20">
                <span className="text-2xl font-black font-outfit">{currentBpm}</span>
                <span className="text-[8px] block font-bold uppercase tracking-widest text-slate-600">BPM ATUAL</span>
              </div>
            )}

            {/* Visual Beat Indicator */}
            {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-3/4 border-2 border-white/10 rounded-full animate-ping"></div>
                </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-outfit font-black text-white leading-tight tracking-tighter">{lesson.title}</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">{lesson.description}</p>
          </div>

          <div className="bg-[#111218] p-8 md:p-10 rounded-[50px] border border-slate-800/50 space-y-8 shadow-3xl">
            <audio 
              ref={audioRef} 
              src={lesson.audioUrl} 
              onTimeUpdate={handleTimeUpdate} 
              onLoadedMetadata={(e) => {
                setDuration(audioRef.current?.duration || 0);
                (e.target as HTMLAudioElement).playbackRate = playbackRate;
              }} 
              onEnded={() => setIsPlaying(false)} 
            />

            {/* Controle de Velocidade / BPM Profissional */}
            <div className="bg-black/40 p-5 rounded-[32px] border border-white/5 space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full bg-cyan-500 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajuste de Velocidade</span>
                </div>
                <div className="bg-white text-black px-3 py-1 rounded-full">
                  <span className="text-xs font-black">{Math.round(playbackRate * 100)}%</span>
                </div>
              </div>
              
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.01"
                value={playbackRate} 
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-cyan-500 cursor-pointer shadow-inner" 
              />
              
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 0.75, 1.0, 1.25].map(val => (
                  <button 
                    key={val}
                    onClick={() => setPlaybackRate(val)}
                    className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                      playbackRate === val 
                        ? 'bg-white text-black border-white shadow-lg' 
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                    }`}
                  >
                    {val === 1.0 ? 'NORMAL' : `${val}x`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={handleSeek} 
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-white cursor-pointer group-hover:accent-cyan-400 transition-all" 
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <span className="text-white">{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span className="opacity-50">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 md:gap-12">
              <button 
                onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15 }} 
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all active:scale-90"
              >
                <i className="fas fa-undo-alt text-xl"></i>
              </button>
              
              <button 
                onClick={togglePlay} 
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all group ${
                    isPlaying ? 'bg-white text-black' : 'bg-transparent border-2 border-white text-white'
                }`}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
              </button>

              <button 
                onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15 }} 
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all active:scale-90"
              >
                <i className="fas fa-redo-alt text-xl"></i>
              </button>
            </div>

            <button 
              onClick={handleComplete} 
              disabled={completing} 
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-white hover:to-white hover:text-black py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] border border-white/5 transition-all shadow-xl disabled:opacity-50 active:scale-[0.98]"
            >
              {completing ? 'Salvando progresso...' : 'Finalizar Exercício'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;