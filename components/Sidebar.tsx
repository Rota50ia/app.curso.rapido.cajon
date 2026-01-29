
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  profile: any;
  isOpen: boolean;
  onClose: () => void;
}

const MetronomeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L7 22h10l-5-20z" />
    <path d="M12 18a2 2 0 100-4 2 2 0 000 4z" />
    <path d="M12 14l4-7" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, profile, isOpen, onClose }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: 'fas fa-home', label: 'Início' },
    { id: AppView.LIBRARY, icon: 'fas fa-headphones', label: 'Biblioteca' },
    { id: AppView.PRACTICE, icon: 'metronome-custom', label: 'Metrônomo' },
  ];

  return (
    <>
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
              <div className="w-10 h-10 bg-transparent border-2 border-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <svg viewBox="0 0 200 240" className="w-6 h-6 fill-none stroke-white" strokeWidth="12">
                   <path d="M40 60 L130 55 L130 185 L40 195 Z" />
                   <path d="M130 55 L175 45 L175 170 L130 185 Z" />
                   <path d="M40 60 L85 50 L175 45 L130 55 Z" />
                   <circle cx="85" cy="125" r="30" />
                </svg>
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
                {item.icon === 'metronome-custom' ? (
                  <MetronomeIcon className="w-5 h-5" />
                ) : (
                  <i className={`${item.icon} w-5 text-lg text-center`}></i>
                )}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 text-center">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">EDILSON MORAIS © 2026</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
