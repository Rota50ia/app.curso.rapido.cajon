
import React, { useState, useEffect, useCallback } from 'react';
import { Track } from '../types';
import { supabase, getAudioUrl } from '../lib/supabase';

const CajonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor" strokeWidth="12">
     <path d="M40 60 L130 55 L130 185 L40 195 Z" />
     <path d="M130 55 L175 45 L175 170 L130 185 Z" />
     <path d="M40 60 L85 50 L175 45 L130 55 Z" />
     <circle cx="85" cy="125" r="30" />
  </svg>
);

interface AudioLibraryViewProps {
  onSelectTrack: (track: Track) => void;
}

const AudioLibraryView: React.FC<AudioLibraryViewProps> = ({ onSelectTrack }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTracks = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const { data, error } = await supabase.storage
        .from('curso-rapido-cajon-faixas-audio')
        .list('', {
          limit: 1000, // Preparado para muitos áudios
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      if (data) {
        const formattedTracks: Track[] = data
          .filter(file => file.name.toLowerCase().endsWith('.mp3'))
          .map((file) => {
            const fileName = file.name.toLowerCase();
            // Lógica de Categorização Automática baseada no nome
            let level = 'Groove';
            if (fileName.includes('aula') || fileName.includes('tecnica')) level = 'Técnica';
            if (fileName.includes('bpm') || /\d+/.test(fileName)) level = 'Treino';
            if (fileName.includes('exercicio')) level = 'Prática';

            return {
              id: file.id,
              name: file.name.replace('.mp3', '').replace(/-/g, ' ').replace(/_/g, ' '),
              url: getAudioUrl(file.name),
              thumbnail: '',
              level: level,
              duration: 'Áudio MP3'
            };
          });
        
        setTracks(formattedTracks);
      }
    } catch (err) {
      console.error('Erro ao carregar biblioteca:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const filteredTracks = tracks.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.3em] mb-1">Bucket Supabase</p>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Sincronizando trilhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#111218] px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <i className={`fas fa-compact-disc text-cyan-500 text-xs ${refreshing ? 'animate-spin' : 'animate-spin-slow'}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {tracks.length} Arquivos no Bucket
            </span>
          </div>
          <button 
            onClick={() => fetchTracks(true)}
            disabled={refreshing}
            className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all ${refreshing ? 'opacity-50' : 'active:scale-95'}`}
            title="Sincronizar com Supabase"
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
        
        <div className="relative w-full sm:w-80">
           <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
           <input 
             type="text" 
             placeholder="Buscar ritmo ou aula..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-[#111218] border border-slate-800 rounded-[20px] py-4 pl-14 pr-6 text-sm focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 shadow-inner"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTracks.map((track) => (
          <div 
            key={track.id} 
            className="group bg-[#111218] rounded-[40px] border border-slate-800/50 overflow-hidden hover:border-cyan-500/30 transition-all flex flex-col shadow-2xl cursor-pointer"
            onClick={() => onSelectTrack(track)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0e13] flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-50"></div>
              
              <CajonIcon className="w-24 h-24 text-slate-800/40 transition-all duration-700 group-hover:scale-110 group-hover:text-cyan-900/20" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute top-6 left-6 bg-cyan-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg">
                {track.level}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                  <CajonIcon className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                 <h3 className="text-white font-outfit font-black text-xl leading-tight uppercase italic truncate drop-shadow-lg">{track.name}</h3>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col bg-[#111218]">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  <span>Iniciar Groove</span>
                </span>
                <i className="fas fa-play-circle text-lg text-cyan-500/50 group-hover:text-cyan-500 group-hover:scale-110 transition-all"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTracks.length === 0 && (
        <div className="text-center py-20 bg-[#111218] rounded-[40px] border border-dashed border-slate-800/50">
           <CajonIcon className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-10" />
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Nenhum áudio encontrado</p>
        </div>
      )}
    </div>
  );
};

export default AudioLibraryView;
