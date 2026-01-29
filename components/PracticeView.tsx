
import React from 'react';
import Metronome from './Metronome';

const PracticeView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-12">
          <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full mb-4">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Laboratório de Tempo</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-outfit font-black text-white uppercase italic tracking-tighter">
            Domine o <span className="text-cyan-500">Groove</span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 font-medium">A precisão é o segredo de um grande cajoneiro.</p>
        </header>

        <Metronome />
        
        <footer className="mt-16 flex flex-col items-center gap-4">
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Precisão</span>
              <span className="text-white text-xs font-bold italic uppercase tracking-tighter">Quartz Digital</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Feedback</span>
              <span className="text-white text-xs font-bold italic uppercase tracking-tighter">Visual Pulse</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PracticeView;
