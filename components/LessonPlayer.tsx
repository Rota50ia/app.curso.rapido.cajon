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
        console.log("Interação requerida para áudio");
      });
    }
    // Salva tempo ao desmontar o componente de forma preventiva
    return () => {
      savePracticeTime(false);
    };
  }, []);

  const savePracticeTime = async (isExplicit: boolean) => {
    const timeSpentMs = Date.now() - startTime;
    const minutesSpent = Math.max(0, Math.floor(timeSpentMs / 60000));
    
    if (minutesSpent > 0 && userId) {
      try {
        // Incremento atômico via RPC ou cálculo manual seguro
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

      <div className="flex-1 overflow-y-auto px-6 py-12">
        <div className="max-w-md mx-auto flex flex-col gap-10">
          
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5 group">
            <img 
              src={lesson.thumbnail} 
              alt={lesson.title} 
              className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <i className="fas fa-music text-white text-xl animate-bounce"></i>
               </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-3xl font-outfit font-black text-white leading-tight tracking-tighter">{lesson.title}</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">{lesson.description}</p>
          </div>

          <div className="bg-[#111218] p-10 rounded-[50px] border border-slate-800/50 space-y-10 shadow-3xl">
            <audio 
              ref={audioRef} 
              src={lesson.audioUrl} 
              onTimeUpdate={handleTimeUpdate} 
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
              onEnded={() => setIsPlaying(false)} 
            />

            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleSeek} 
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-cyan-500 cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span className="text-cyan-500/50">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-12">
              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15 }} className="text-slate-600 hover:text-cyan-400 transition-colors active:scale-90"><i className="fas fa-undo-alt text-2xl"></i></button>
              <button onClick={togglePlay} className="w-24 h-24 rounded-full bg-orange-500 border-[6px] border-orange-600/30 flex items-center justify-center text-white text-3xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-all">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
              </button>
              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15 }} className="text-slate-600 hover:text-cyan-400 transition-colors active:scale-90"><i className="fas fa-redo-alt text-2xl"></i></button>
            </div>

            <button 
              onClick={handleComplete} 
              disabled={completing} 
              className="w-full bg-white text-black py-6 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:bg-cyan-400 shadow-xl disabled:opacity-50 active:scale-[0.98]"
            >
              {completing ? 'Registrando Lição...' : 'Concluir Aula'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;