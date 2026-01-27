
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/40 to-slate-900 rounded-[40px] p-8 md:p-12 border border-blue-500/20 shadow-2xl">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-outfit font-black text-white mb-4 leading-tight">
            Fala, {profile?.nome?.split(' ')[0] || 'Baterista'}! <br/>
            <span className="text-cyan-400">Pronto para o groove?</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed font-medium">
            Você já concluiu {profile?.aulas_concluidas || 0} aulas. Mantenha a constância para dominar o Cajon.
          </p>
          <button 
            onClick={() => onSelectLesson(recentLessons[profile?.aulas_concluidas % 3 || 0])}
            className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-cyan-400 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Continuar Curso
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
           <i className="fas fa-drum text-[300px] text-white"></i>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111218] p-8 rounded-[32px] border border-slate-800/50 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px]"></div>
          <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-clock text-cyan-500 text-xl"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Tempo de Prática</h3>
          <p className="text-3xl font-black text-white font-outfit">{tempoFormatado(profile?.tempo_pratica_minutos || 0)}</p>
        </div>

        <div className="bg-[#111218] p-8 rounded-[32px] border border-slate-800/50 hover:border-purple-500/30 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px]"></div>
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-check-circle text-purple-500 text-xl"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Aulas Concluídas</h3>
          <p className="text-3xl font-black text-white font-outfit">{profile?.aulas_concluidas || 0} / 45</p>
        </div>

        <div className="bg-[#111218] p-8 rounded-[32px] border border-slate-800/50 hover:border-orange-500/30 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px]"></div>
          <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-fire text-orange-500 text-xl"></i>
          </div>
          <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Streak Atual</h3>
          <p className="text-3xl font-black text-white font-outfit">{profile?.streak || 0} Dias</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-outfit font-bold text-white tracking-tight">Recentes para você</h3>
          <button onClick={() => onSelectView(AppView.LESSONS)} className="text-cyan-400 hover:text-cyan-300 font-bold text-sm uppercase tracking-wider">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentLessons.map((lesson) => (
            <div 
              key={lesson.id} 
              onClick={() => onSelectLesson(lesson)}
              className="bg-[#111218] rounded-[32px] border border-slate-800/50 overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-xl cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={lesson.thumbnail} 
                  alt={lesson.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                     <i className="fas fa-play text-black text-xl ml-1"></i>
                   </div>
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-3 block">{lesson.level}</span>
                <h4 className="text-white font-bold text-lg mb-4 leading-tight group-hover:text-cyan-400 transition-colors">{lesson.title}</h4>
                <div className="flex items-center text-xs text-slate-500 font-bold gap-4">
                  <span className="flex items-center gap-2"><i className="fas fa-headphones text-cyan-500/50"></i> Audio Aula</span>
                  <span className="flex items-center gap-2"><i className="fas fa-clock text-cyan-500/50"></i> {lesson.duration}</span>
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
