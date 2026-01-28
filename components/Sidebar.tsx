
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  profile: any;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, profile, isOpen, onClose }) => {
  const TOTAL_AULAS = 45;
  const aulasConcluidas = profile?.aulas_concluidas || 0;
  const progressoPercent = Math.min(Math.round((aulasConcluidas / TOTAL_AULAS) * 100), 100);

  const menuItems = [
    { id: AppView.DASHBOARD, icon: 'fas fa-home', label: 'Início' },
    { id: AppView.LESSONS, icon: 'fas fa-play-circle', label: 'Aulas' },
    { id: AppView.PRACTICE, icon: 'fas fa-metronome', label: 'Prática' },
    { id: AppView.AI_COACH, icon: 'fas fa-robot', label: 'Mentor IA' },
    { id: AppView.ADMIN, icon: 'fas fa-user-shield', label: 'Admin' },
  ];

  return (
    <>
      {/* Overlay para fechar no mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0d0e13] border-r border-slate-800/50 flex flex-col z-[70] transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.3)]">
                <i className="fas fa-drum text-white text-xl"></i>
              </div>
              <span className="text-xs font-outfit font-extrabold text-white tracking-tight uppercase leading-none">
                Curso Rápido <br/> de <span className="text-cyan-400 text-base">Cajón</span>
              </span>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-500 p-2">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === item.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <i className={`${item.icon} w-5 text-lg text-center`}></i>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50 space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Progresso</p>
              <span className="text-[10px] font-black text-cyan-400">{progressoPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full mb-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-blue-500"
                style={{ width: `${progressoPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {aulasConcluidas}/45 lições
            </p>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <i className="fas fa-sign-out-alt w-5 text-lg group-hover:rotate-12"></i>
            <span className="font-bold text-sm">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
