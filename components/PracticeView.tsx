
import React, { useState } from 'react';
import Metronome from './Metronome';

const RHYTHM_PRESETS = [
  { name: 'Samba Reggae', pattern: 'B . C . B B C .', desc: 'Clássico baiano adaptado' },
  { name: 'Pop Rock 4/4', pattern: 'B . C . B . C .', desc: 'O groove que toca tudo' },
  { name: 'Funk 70s', pattern: 'B . C G B G C .', desc: 'Síncope e ghost notes' },
  { name: 'Rumba', pattern: 'C S . B C S . B', desc: 'Acento no estalo (slap)' },
];

const PracticeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metronome' | 'generator'>('metronome');
  const [selectedRhythm, setSelectedRhythm] = useState(RHYTHM_PRESETS[1]);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex justify-center">
        <div className="bg-[#111218] p-1.5 rounded-[24px] border border-slate-800/50 flex shadow-2xl">
          <button 
            onClick={() => setActiveTab('metronome')}
            className={`px-10 py-3 rounded-[18px] font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === 'metronome' 
                ? 'bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Metrônomo
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`px-10 py-3 rounded-[18px] font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === 'generator' 
                ? 'bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Ritmos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 order-2 lg:order-1">
          {activeTab === 'metronome' ? (
            <Metronome />
          ) : (
            <div className="bg-[#111218] border border-slate-800/50 p-8 rounded-[40px] shadow-2xl space-y-8">
              <div>
                <h3 className="text-white font-outfit font-black text-2xl mb-2">Biblioteca de Grooves</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Selecione um estilo para visualizar a partitura simplificada.
                </p>
              </div>
              
              <div className="space-y-3">
                {RHYTHM_PRESETS.map(style => (
                  <button 
                    key={style.name}
                    onClick={() => setSelectedRhythm(style)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                      selectedRhythm.name === style.name 
                        ? 'bg-orange-500/10 border-orange-500/30 text-white' 
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-left">
                      <span className="font-bold block">{style.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black">{style.desc}</span>
                    </div>
                    <i className={`fas ${selectedRhythm.name === style.name ? 'fa-check-circle text-orange-500' : 'fa-chevron-right opacity-20'}`}></i>
                  </button>
                ))}
              </div>
              
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
                <p className="text-[10px] text-orange-500 font-black uppercase mb-4 tracking-[0.3em] text-center">Partitura Digital</p>
                <div className="flex gap-4 font-mono text-3xl text-white font-black justify-center tracking-[0.2em] bg-black/40 py-6 rounded-2xl border border-white/5 shadow-inner">
                  {selectedRhythm.pattern.split(' ').map((char, i) => (
                    <span key={i} className={char === '.' ? 'text-slate-800' : 'text-cyan-400'}>{char}</span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between px-2">
                   <span className="text-[10px] text-slate-600 font-bold">B=Bumbo</span>
                   <span className="text-[10px] text-slate-600 font-bold">C=Caixa</span>
                   <span className="text-[10px] text-slate-600 font-bold">S=Slap</span>
                   <span className="text-[10px] text-slate-600 font-bold">G=Ghost</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
           <div className="bg-[#111218] border border-slate-800/50 rounded-[40px] p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-white font-outfit font-black text-2xl">Missões Diárias</h3>
                <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">Ativo</div>
             </div>
             <div className="space-y-4">
               {[
                 { title: 'Precisão de Tempo', xp: '+50 XP', desc: 'Mantenha 100 BPM por 2 minutos sem oscilar.' },
                 { title: 'Velocidade Slap', xp: '+120 XP', desc: 'Atingir 140 BPM com clareza nos estalos.' },
                 { title: 'Dinâmica de Mão', xp: '+80 XP', desc: 'Alternar entre bumbo forte e ghost notes suaves.' }
               ].map((task, i) => (
                 <div key={i} className="flex gap-5 p-5 rounded-3xl bg-slate-800/20 hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-700/50 group cursor-pointer">
                   <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-500 font-black text-lg group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg">
                      {i + 1}
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="text-white font-bold text-lg">{task.title}</h4>
                       <span className="text-xs font-black text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg border border-cyan-400/20">{task.xp}</span>
                     </div>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed">{task.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[32px] p-8 text-white shadow-2xl flex items-center gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
              <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl items-center justify-center text-4xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
                <i className="fas fa-headphones"></i>
              </div>
              <div className="relative z-10">
                <h4 className="text-xl font-outfit font-black mb-2 uppercase tracking-tight">Dica de Mestre</h4>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">"O segredo do bom Cajon está no contraste. Deixe o bumbo respirar e faça a caixa estalar como um chicote."</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeView;
