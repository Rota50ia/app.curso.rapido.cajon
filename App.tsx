
import React, { useState, useEffect } from 'react';
import { AppView, Lesson } from './types';
import Dashboard from './components/Dashboard';
import LessonsView from './components/LessonsView';
import PracticeView from './components/PracticeView';
import AICoachView from './components/AICoachView';
import AdminView from './components/AdminView';
import LessonPlayer from './components/LessonPlayer';
import Sidebar from './components/Sidebar';
import AuthView from './components/AuthView';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error) {
      setProfile(data);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-bold animate-pulse">Sincronizando Seus Dados...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onSelectView={setCurrentView} onSelectLesson={(l) => setSelectedLesson(l)} profile={profile} />;
      case AppView.LESSONS:
        return <LessonsView onSelectLesson={(l) => setSelectedLesson(l)} />;
      case AppView.PRACTICE:
        return <PracticeView />;
      case AppView.AI_COACH:
        return <AICoachView />;
      case AppView.ADMIN:
        return <AdminView />;
      default:
        return <Dashboard onSelectView={setCurrentView} onSelectLesson={(l) => setSelectedLesson(l)} profile={profile} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090d] text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
        profile={profile} 
      />
      
      <main className="flex-1 ml-0 md:ml-64 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-[#08090d]/80 backdrop-blur-md z-30 py-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-outfit font-bold text-white">
              {currentView === AppView.DASHBOARD && "Painel do Aluno"}
              {currentView === AppView.LESSONS && "Curso de Cajon"}
              {currentView === AppView.PRACTICE && "Espaço de Treino"}
              {currentView === AppView.AI_COACH && "Mentor IA"}
              {currentView === AppView.ADMIN && "Painel do Instrutor"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView(AppView.ADMIN)}
              className={`hidden sm:flex items-center px-4 py-2 rounded-full border border-slate-800 transition-all ${
                currentView === AppView.ADMIN ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-[#111218] text-slate-500 hover:text-white'
              }`}
            >
              <i className="fas fa-user-shield mr-2"></i>
              <span className="text-sm font-bold uppercase tracking-wider">Admin</span>
            </button>
            
            <div className="hidden sm:flex items-center bg-[#111218] px-4 py-2 rounded-full border border-slate-800 shadow-lg">
              <i className="fas fa-fire text-orange-500 mr-2"></i>
              <span className="text-sm font-bold text-white">Streak: {profile?.streak || 0}</span>
            </div>
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            />
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>

      {selectedLesson && (
        <LessonPlayer 
          lesson={selectedLesson} 
          onClose={() => setSelectedLesson(null)} 
          onComplete={() => {
            setSelectedLesson(null);
            fetchProfile(session.user.id);
          }}
          userId={session.user.id}
        />
      )}
    </div>
  );
};

export default App;
