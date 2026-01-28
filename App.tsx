
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-[#08090d] text-slate-200 overflow-x-hidden">
      {/* Sidebar Mobile & Desktop */}
      <Sidebar 
        currentView={currentView} 
        setView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout} 
        profile={profile} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 w-full md:ml-64 p-4 md:p-8 overflow-x-hidden">
        <header className="flex justify-between items-center mb-6 sticky top-0 bg-[#08090d]/90 backdrop-blur-md z-30 py-3 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-white"
            >
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="text-xl md:text-2xl font-outfit font-bold text-white truncate max-w-[150px] sm:max-w-none">
              {currentView === AppView.DASHBOARD && "Painel"}
              {currentView === AppView.LESSONS && "Curso"}
              {currentView === AppView.PRACTICE && "Prática"}
              {currentView === AppView.AI_COACH && "Mentor IA"}
              {currentView === AppView.ADMIN && "Admin"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center bg-[#111218] px-3 py-1.5 rounded-full border border-slate-800 shadow-lg">
              <i className="fas fa-fire text-orange-500 mr-1.5 text-xs"></i>
              <span className="text-xs font-black text-white">{profile?.streak || 0}</span>
            </div>
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`} 
              alt="Avatar" 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-500"
            />
          </div>
        </header>

        <div className="max-w-6xl mx-auto pb-20">
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
