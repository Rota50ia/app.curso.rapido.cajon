
import React from 'react';
import { Lesson } from '../types';
import { getAudioUrl } from '../lib/supabase';

interface LessonsViewProps {
  onSelectLesson: (lesson: Lesson) => void;
}

const lessons: Lesson[] = [
  { 
    id: '1', 
    title: 'A Postura Correta no Cajon', 
    level: 'Iniciante', 
    duration: '10 min', 
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', 
    description: 'A base de tudo. Aprenda como sentar e posicionar as mãos para tirar o melhor som sem se cansar.',
    audioUrl: getAudioUrl('aula-1-postura.mp3'),
    bpm: 80
  },
  { 
    id: '2', 
    title: 'O Som de Bumbo Profundo', 
    level: 'Iniciante', 
    duration: '12 min', 
    thumbnail: 'https://images.unsplash.com/photo-1520522139311-09405d454a85?auto=format&fit=crop&q=80&w=800', 
    description: 'A técnica essencial para os graves. Como atingir a nota certa no centro do instrumento.',
    audioUrl: getAudioUrl('aula-2-bumbo.mp3'),
    bpm: 90
  },
  { 
    id: '3', 
    title: 'Técnica de Caixa e Slap', 
    level: 'Iniciante', 
    duration: '15 min', 
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800', 
    description: 'Aprenda os agudos brilhantes. A técnica do estalo (slap) para dar brilho ao seu ritmo.',
    audioUrl: getAudioUrl('aula-3-caixa.mp3'),
    bpm: 100
  },
  { 
    id: '4', 
    title: 'Seu Primeiro Groove 4/4', 
    level: 'Intermediário', 
    duration: '20 min', 
    thumbnail: 'https://images.unsplash.com/photo-1544692885-80c1df079774?auto=format&fit=crop&q=80&w=800', 
    description: 'Combinando bumbo e caixa em um ritmo sólido que serve para 90% das músicas pop/rock.',
    audioUrl: getAudioUrl('aula-4-groove.mp3'),
    bpm: 110
  },
  { 
    id: '5', 
    title: 'Ghost Notes e Dinâmica', 
    level: 'Avançado', 
    duration: '30 min', 
    thumbnail: 'https://images.unsplash.com/photo-1465821508027-561b82d5df75?auto=format&fit=crop&q=80&w=800', 
    description: 'O segredo dos profissionais. Como preencher o ritmo com notas fantasmas sutis.',
    audioUrl: getAudioUrl('aula-5-dinamica.mp3'),
    bpm: 120
  },
  { 
    id: '6', 
    title: 'Variações de Rumba Flamenca', 
    level: 'Avançado', 
    duration: '25 min', 
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800', 
    description: 'Explorando as raízes. Ritmos rápidos e coordenação avançada para estilos latinos.',
    audioUrl: getAudioUrl('aula-6-rumba.mp3'),
    bpm: 140
  },
];

const LessonsView: React.FC<LessonsViewProps> = ({ onSelectLesson }) => {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-[#111218] p-1.5 rounded-2xl border border-slate-800">
          <button className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Todos</button>
          <button className="px-8 py-2.5 text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-widest">Iniciante</button>
          <button className="px-8 py-2.5 text-slate-500 hover:text-slate-300 font-bold text-xs uppercase tracking-widest">Avançado</button>
        </div>
        <div className="relative w-full sm:w-80">
           <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
           <input 
             type="text" 
             placeholder="Qual técnica quer dominar?" 
             className="w-full bg-[#111218] border border-slate-800 rounded-[20px] py-3.5 pl-14 pr-6 text-sm focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            className="group bg-[#111218] rounded-[40px] border border-slate-800/50 overflow-hidden hover:border-cyan-500/30 transition-all flex flex-col shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={lesson.thumbnail} 
                alt={lesson.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-60"></div>
              <div className="absolute top-6 left-6 bg-cyan-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                {lesson.level}
              </div>
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/10">
                <i className="fas fa-clock mr-2 text-cyan-500"></i>
                {lesson.duration}
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-white font-outfit font-bold text-xl mb-4 group-hover:text-cyan-400 transition-colors leading-tight">{lesson.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                {lesson.description}
              </p>
              
              <button 
                onClick={() => onSelectLesson(lesson)}
                className="mt-auto w-full bg-slate-800 hover:bg-white hover:text-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn"
              >
                Ouvir Aula
                <i className="fas fa-play text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsView;
