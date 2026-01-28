
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
  const [startTime] = useState(Date.now());
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        console.log("Autoplay bloqueado");
      });
    }
    return () => {
      savePracticeTime();
    };
  }, []);

  const savePracticeTime = async () => {
    const timeSpentMs = Date.now() - startTime;
    const minutesSpent = Math.max(1, Math.floor(timeSpentMs / 60000));
    
    if (minutesSpent > 0) {
      try {
        const { data: profile } = await supabase.from('profiles').select('tempo_pratica_minutos').eq('id', userId).single();
        await supabase.from('profiles').update({ tempo_pratica_minutos: (profile?.tempo_pratica_minutos || 0) + minutesSpent }).eq('id', userId);
      } catch (e) {}
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
    setCompleting(true);
    try {
      await savePracticeTime();
      const { data: profile } = await supabase.from('profiles').select('aulas_concluidas').eq('id', userId).single();
      await supabase.from('profiles').update({ aulas_concluidas: (profile?.aulas_concluidas || 0) + 1 }).eq('id', userId);
      onComplete();
    } catch (err) {
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08090d] flex flex-col animate-in fade-in duration-300">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0d0e13]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-slate-400 p-2 hover:text-white">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <span className="text-cyan-400 text-[8px] font-black uppercase tracking-widest">{lesson.level}</span>
            <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{lesson.title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700">
          <i className="fas fa-times text-xs"></i>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto flex flex-col gap-8">
          
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 mx-auto w-full max-w-[320px]">
            <img src={lesson.thumbnail} alt={lesson.title} className={`w-full h-full object-cover transition-transform duration-[20s] ${isPlaying ? 'scale-110' : 'scale-100'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-outfit font-black text-white mb-4 leading-tight">{lesson.title}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">{lesson.description}</p>
          </div>

          <div className="bg-[#111218] p-8 rounded-[40px] border border-slate-800/50 space-y-8 shadow-2xl">
            <audio ref={audioRef} src={lesson.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setIsPlaying(false)} />

            <div className="space-y-3">
              <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-cyan-500" />
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-10">
              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }} className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-undo-alt text-xl"></i></button>
              <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl shadow-[0_10px_25px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
              </button>
              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }} className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-redo-alt text-xl"></i></button>
            </div>

            <button onClick={handleComplete} disabled={completing} className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50">
              {completing ? 'Salvando...' : 'Concluir Aula'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
