
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  profile: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, profile }) => {
  const TOTAL_AULAS = 45;
  const aulasConcluidas = profile?.aulas_concluidas || 0;
  const progressoPercent = Math.min(Math.round((aulasConcluidas / TOTAL_AULAS) * 100), 100);

  const menuItems = [
    { id: AppView.DASHBOARD, icon: 'fas fa-home', label: 'Início' },
    { id: AppView.LESSONS, icon: 'fas fa-play-circle', label: 'Aulas' },
    { id: AppView.PRACTICE, icon: 'fas fa-metronome', label: 'Prática' },
    { id: AppView.AI_COACH, icon: 'fas fa-robot', label: 'Mentor IA' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex-col z-50 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
            <i className="fas fa-drum text-white text-xl"></i>
          </div>
          <span className="text-sm font-outfit font-extrabold text-white tracking-tight uppercase leading-none">
            Curso Rápido <br/> de <span className="text-orange-500 text-lg">Cajón</span>
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className={`${item.icon} w-5 text-lg`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
        >
          <i className="fas fa-sign-out-alt w-5 text-lg group-hover:rotate-12 transition-transform"></i>
          <span className="font-medium">Sair</span>
        </button>
        
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Progresso</p>
            <span className="text-[10px] font-black text-orange-500">{progressoPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000"
              style={{ width: `${progressoPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {aulasConcluidas} de {TOTAL_AULAS} lições
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;