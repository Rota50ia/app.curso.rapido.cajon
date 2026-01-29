
import React, { useState, useEffect } from 'react';
import { AppView, Track } from '../types';
import { supabase, getAudioUrl } from '../lib/supabase';

const CajonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor" strokeWidth="12">
     <path d="M40 60 L130 55 L130 185 L40 195 Z" />
     <path d="M130 55 L175 45 L175 170 L130 185 Z" />
     <path d="M40 60 L85 50 L175 45 L130 55 Z" />
     <circle cx="85" cy="125" r="30" />
  </svg>
);

interface DashboardProps {
  onSelectView: (view: AppView) => void;
  onSelectTrack: (track: Track) => void;
  profile: any;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectView, onSelectTrack, profile }) => {
  const [suggestions, setSuggestions] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTracks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage
          .from('curso-rapido-cajon-faixas-audio')
          .list('', { limit: 4, sortBy: { column: 'name', order: 'desc' } });

        if (data) {
          const formatted = data
            .filter(f => f.name.toLowerCase().endsWith('.mp3'))
            .map(f => ({
              id: f.id,
              name: f.name.replace('.mp3', '').replace(/-/g, ' '),
              url: getAudioUrl(f.name),
              thumbnail: '',
              level: 'Premium',
              duration: 'MP3'
            }));
          setSuggestions(formatted);
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchLatestTracks();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#111218] via-cyan-500/5 to-[#111218] rounded-[24px] md:rounded-[40px] p-6 md:p-14 border border-white/[0.03] shadow-2xl">
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
             <span className="text-[8px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">Estúdio Digital</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-outfit font-black text-white mb-3 leading-tight uppercase italic tracking-tighter">
            Fala, {profile?.nome?.split(' ')[0] || 'Cajoneiro'}!<br/>
            <span className="text-cyan-400 text-3xl md:text-5xl">Bora pro groove?</span>
          </h2>
          <p className="text-slate-400 mb-6 text-xs md:text-lg font-medium leading-relaxed max-w-sm md:max-w-none mx-auto md:mx-0">
            Seus áudios de treino estão prontos. Escolha um ritmo e comece agora.
          </p>
          <button 
            onClick={() => onSelectView(AppView.LIBRARY)}
            className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all uppercase tracking-widest shadow-xl shadow-black/20"
          >
            Abrir Biblioteca
          </button>
        </div>
        <div className="absolute -right-16 -bottom-16 opacity-[0.05] rotate-12 pointer-events-none hidden md:block">
           <CajonIcon className="w-[400px] h-[400px] text-white" />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-5 border-b border-white/[0.03] pb-4">
          <h3 className="text-sm md:text-xl font-outfit font-black text-white uppercase italic tracking-tight">Novidades</h3>
          <button onClick={() => onSelectView(AppView.LIBRARY)} className="text-cyan-400 font-bold text-[9px] uppercase tracking-widest active:text-white transition-colors">Ver Tudo</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111218] rounded-2xl h-40 md:h-64 animate-pulse"></div>
            ))
          ) : (
            suggestions.map((track) => (
              <div 
                key={track.id} 
                onClick={() => onSelectTrack(track)}
                className="bg-[#111218] rounded-2xl md:rounded-[30px] border border-white/[0.03] overflow-hidden group active:scale-[0.98] transition-all cursor-pointer shadow-lg flex flex-col"
              >
                <div className="relative h-28 md:h-44 bg-[#0d0e13] flex items-center justify-center overflow-hidden">
                  <CajonIcon className="w-10 md:w-16 text-slate-800 opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-400 text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Novo</div>
                </div>
                <div className="p-3 md:p-6 flex-1">
                  <h4 className="text-white font-bold text-[10px] md:text-base leading-tight uppercase italic line-clamp-2">{track.name}</h4>
                  <div className="mt-2 flex items-center text-[7px] md:text-[9px] text-slate-600 font-black uppercase tracking-widest">
                    <i className="fas fa-play mr-1.5 text-cyan-500/50"></i> Praticar
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
