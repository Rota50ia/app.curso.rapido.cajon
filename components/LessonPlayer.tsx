
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

  // Iniciar áudio automaticamente ao carregar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        console.log("Autoplay bloqueado pelo navegador. Aguardando interação.");
      });
    }
    
    // Cleanup ao fechar: Salvar tempo de prática
    return () => {
      savePracticeTime();
    };
  }, []);

  const savePracticeTime = async () => {
    const timeSpentMs = Date.now() - startTime;
    const minutesSpent = Math.max(1, Math.floor(timeSpentMs / 60000));
    
    if (minutesSpent > 0) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tempo_pratica_minutos')
          .eq('id', userId)
          .single();
        
        await supabase
          .from('profiles')
          .update({ tempo_pratica_minutos: (profile?.tempo_pratica_minutos || 0) + minutesSpent })
          .eq('id', userId);
      } catch (e) {
        console.error("Falha ao salvar tempo de prática");
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (!isNaN(total)) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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
      // Salvar tempo antes de fechar
      await savePracticeTime();

      const { data: profile } = await supabase
        .from('profiles')
        .select('aulas_concluidas')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('profiles')
        .update({ aulas_concluidas: (profile?.aulas_concluidas || 0) + 1 })
        .eq('id', userId);

      if (error) throw error;
      onComplete();
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#08090d] flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0d0e13]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
          <div>
            <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{lesson.level}</span>
            <h2 className="text-xl font-outfit font-bold text-white">{lesson.title}</h2>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-500 transition-all"
        >
          <i className="fas fa-times"></i>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Visual Section */}
          <div className="space-y-8">
            <div className="relative aspect-square rounded-[48px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5 group">
              <img 
                src={lesson.thumbnail} 
                alt={lesson.title} 
                className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-125' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              {/* Visualizer */}
              <div className="absolute bottom-12 left-0 right-0 flex items-end justify-center gap-1.5 h-16">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 bg-orange-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-2 opacity-30'}`}
                    style={{ 
                      height: isPlaying ? `${20 + Math.random() * 80}%` : '8px',
                      animationDelay: `${i * 0.05}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-orange-500/20">Audio Aula</span>
                <span className="text-slate-500 text-xs font-bold"><i className="fas fa-headphones mr-1.5"></i> {lesson.duration}</span>
              </div>
              <h3 className="text-4xl font-outfit font-black text-white mb-6 leading-tight">{lesson.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium text-lg">
                {lesson.description}
              </p>
            </div>

            <div className="bg-[#111218] p-8 rounded-[40px] border border-slate-800/50 space-y-8 shadow-2xl">
              <audio 
                ref={audioRef}
                src={lesson.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="space-y-3">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                />
                <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <span className="text-orange-500/80">{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-10">
                <button 
                  onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <i className="fas fa-undo-alt text-xl"></i>
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl shadow-[0_20px_40px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all group"
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1.5'} group-hover:scale-110 transition-transform`}></i>
                </button>

                <button 
                  onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <i className="fas fa-redo-alt text-xl"></i>
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {completing ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-check-circle"></i> Concluir e Salvar</>}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
