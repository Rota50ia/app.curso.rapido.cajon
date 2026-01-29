
import React, { useState, useEffect } from 'react';
import { AppView, Track } from './types';
import Dashboard from './components/Dashboard';
import AudioLibraryView from './components/AudioLibraryView';
import PracticeView from './components/PracticeView';
import AudioPlayer from './components/AudioPlayer';
import Sidebar from './components/Sidebar';
import AuthView from './components/AuthView';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          nome: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          avatar_url: firebaseUser.photoURL
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.3)]"></div>
          <p className="text-cyan-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthView />;

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onSelectView={setCurrentView} onSelectTrack={(t) => setSelectedTrack(t)} profile={profile} />;
      case AppView.LIBRARY:
        return <AudioLibraryView onSelectTrack={(t) => setSelectedTrack(t)} />;
      case AppView.PRACTICE:
        return <PracticeView />;
      default:
        return <Dashboard onSelectView={setCurrentView} onSelectTrack={(t) => setSelectedTrack(t)} profile={profile} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090d] text-slate-200 overflow-x-hidden selection:bg-cyan-500/30">
      <Sidebar 
        currentView={currentView} 
        setView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        profile={profile} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 w-full md:ml-64 p-4 md:p-8 pb-32 md:pb-8">
        <header className="flex justify-between items-center mb-6 sticky top-0 bg-[#08090d]/90 backdrop-blur-md z-30 py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b border-white/[0.03] md:border-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 rounded-xl text-white active:scale-90 transition-transform"
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="text-lg md:text-2xl font-outfit font-black text-white uppercase italic tracking-tighter">
              {currentView === AppView.DASHBOARD && "Painel"}
              {currentView === AppView.LIBRARY && "Biblioteca"}
              {currentView === AppView.PRACTICE && "Metrônomo"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {profile && (
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email || 'user'}`} 
                alt="Avatar" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-cyan-500/50"
              />
            )}
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0e13]/95 backdrop-blur-xl border-t border-white/[0.05] px-6 py-4 flex justify-between items-center z-[50] safe-area-bottom">
        <button 
          onClick={() => setCurrentView(AppView.DASHBOARD)}
          className={`flex flex-col items-center gap-1.5 transition-all ${currentView === AppView.DASHBOARD ? 'text-cyan-400' : 'text-slate-500'}`}
        >
          <i className="fas fa-home text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
        </button>
        <button 
          onClick={() => setCurrentView(AppView.LIBRARY)}
          className={`flex flex-col items-center gap-1.5 transition-all ${currentView === AppView.LIBRARY ? 'text-cyan-400' : 'text-slate-500'}`}
        >
          <i className="fas fa-headphones text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Áudios</span>
        </button>
        <button 
          onClick={() => setCurrentView(AppView.PRACTICE)}
          className={`flex flex-col items-center gap-1.5 transition-all ${currentView === AppView.PRACTICE ? 'text-cyan-400' : 'text-slate-500'}`}
        >
          <i className="fas fa-clock text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Tempo</span>
        </button>
      </nav>

      {selectedTrack && (
        <AudioPlayer 
          track={selectedTrack} 
          onClose={() => setSelectedTrack(null)} 
        />
      )}
    </div>
  );
};

export default App;
