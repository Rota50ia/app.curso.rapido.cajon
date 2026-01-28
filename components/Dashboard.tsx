
import React from 'react';
import { AppView, Lesson } from '../types';

interface DashboardProps {
  onSelectView: (view: AppView) => void;
  onSelectLesson: (lesson: Lesson) => void;
  profile: any;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectView, onSelectLesson, profile }) => {
  const BUCKET_URL = 'https://ctvdlamxicoxniyqcpfd.supabase.co/storage/v1/object/public/lessons';
  const recentLessons: Lesson[] = [
    { 
      id: '1', 
      title: 'A Postura Correta no Cajon', 
      level: 'Iniciante', 
      duration: '10 min', 
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', 
      description: 'A base de tudo. Aprenda como sentar e posicionar as mãos.',
      audioUrl: `${BUCKET_URL}/aula-1-postura.mp3` 
    },
    { 
      id: '2', 
      title: 'O Som de Bumbo Profundo', 
      level: 'Iniciante', 
      duration: '12 min', 
      thumbnail: 'https://images.unsplash.com/photo-1520522139311-09405d454a85?auto=format&fit=crop&q=80&w=800', 
      description: 'A técnica essencial para os graves perfeitos.',
      audioUrl: `${BUCKET_URL}/aula-2-bumbo.mp3`
    },
    { 
      id: '3', 
      title: 'Técnica de Caixa e Slap', 
      level: 'Iniciante', 
      duration: '15 min', 
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800', 
      description: 'Aprenda os agudos brilhantes e o estalo.',
      audioUrl: `${BUCKET_URL}/aula-3-caixa.mp3`
    }
  ];

  const tempoFormatado = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#111218] via-[#00f2fe]/5 to-[#111218] rounded-[30px] md:rounded-[40px] p-6 md:p-12 border border-cyan-500/10 shadow-2xl">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-outfit font-black text-white mb-3 leading-tight">
            Fala, {profile?.nome?.split(' ')[0] || 'Baterista'}! <br/>
            <span className="text-cyan-400">Pronto pro groove?</span>
          </h2>
          <p className="text-slate-400 mb-6 text-sm md:text-lg leading-relaxed font-medium">
            Você já concluiu {profile?.aulas_concluidas || 0} aulas. Mantenha a constância!
          </p>
          <button 
            onClick={() => onSelectLesson(recentLessons[profile?.aulas_concluidas % 3 || 0])}
            className="w-full sm:w-auto bg-white text-black px-8 py-3.5 rounded-2xl font-black text-base hover:bg-cyan-400 transition-all shadow-xl active:scale-95"
          >
            Continuar Curso
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-5 md:opacity-10 rotate-12 pointer-events-none hidden md:block">
           <i className="fas fa-drum text-[300px] text-white"></i>
        </div>
      </section>

      {/* Grid Responsiva original mantida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: 'fas fa-clock', color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Tempo Praticado', value: tempoFormatado(profile?.tempo_pratica_minutos || 0) },
          { icon: 'fas fa-check-circle', color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Aulas Concluídas', value: `${profile?.aulas_concluidas || 0}/45` },
          { icon: 'fas fa-fire', color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Streak Atual', value: `${profile?.streak || 0} Dias` }
        ].map((stat, i) => (
          <div key={i} className="bg-[#111218] p-5 md:p-8 rounded-[30px] border border-slate-800/50 hover:border-cyan-500/20 transition-all relative overflow-hidden group">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <i className={`${stat.icon} ${stat.color} text-xl`}></i>
            </div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-xl md:text-3xl font-black text-white font-outfit">{stat.value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-outfit font-bold text-white uppercase tracking-tight">Recentes</h3>
          <button onClick={() => onSelectView(AppView.LESSONS)} className="text-cyan-400 font-bold text-xs uppercase tracking-widest hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentLessons.map((lesson) => (
            <div 
              key={lesson.id} 
              onClick={() => onSelectLesson(lesson)}
              className="bg-[#111218] rounded-[30px] border border-slate-800/50 overflow-hidden group active:scale-[0.98] transition-all cursor-pointer shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black uppercase text-cyan-400 mb-2 block tracking-widest">{lesson.level}</span>
                <h4 className="text-white font-bold text-base mb-3 leading-tight group-hover:text-cyan-400 transition-colors">{lesson.title}</h4>
                <div className="flex items-center text-[10px] text-slate-500 font-bold gap-4">
                  <span className="flex items-center gap-1.5"><i className="fas fa-headphones"></i> AUDIO</span>
                  <span className="flex items-center gap-1.5"><i className="fas fa-clock"></i> {lesson.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
