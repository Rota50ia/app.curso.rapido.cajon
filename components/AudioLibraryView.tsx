
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('curso-rapido-cajon-faixas-audio')
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      if (data) {
        const formattedTracks: Track[] = data
          .filter(file => file.name.toLowerCase().endsWith('.mp3'))
          .map((file) => {
            const fileName = file.name.toLowerCase();
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
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Sincronizando trilhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Alternador de Visualização */}
          <div className="flex bg-[#111218] p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`w-12 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`w-12 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
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

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTracks.map((track) => (
            <div 
              key={track.id} 
              className="group bg-[#0b0c11] rounded-[40px] border border-white/[0.05] overflow-hidden hover:border-cyan-500/30 transition-all flex flex-col shadow-2xl cursor-pointer"
              onClick={() => onSelectTrack(track)}
            >
              <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-[3px] border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  <CajonIcon className="w-20 h-20 md:w-24 md:h-24 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                  <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-xl"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-6 left-6 bg-cyan-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg z-10">
                  {track.level}
                </div>
                <div className="absolute bottom-8 left-8 right-8 z-10">
                   <h3 className="text-white font-outfit font-black text-xl leading-tight uppercase italic truncate drop-shadow-2xl">{track.name}</h3>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col bg-[#0b0c11]">
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
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className="group flex items-center gap-4 bg-[#0b0c11] border border-white/[0.05] p-4 rounded-[24px] hover:border-cyan-500/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-full bg-black border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <CajonIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-outfit font-bold text-base uppercase italic truncate leading-tight">{track.name}</h3>
                <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">{track.level}</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-full group-hover:bg-cyan-500 transition-all">
                <i className="fas fa-play text-[10px] text-white group-hover:text-black"></i>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
