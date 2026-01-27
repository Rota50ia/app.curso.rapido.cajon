
import React, { useState, useEffect, useRef } from 'react';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClick = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.frequency.value = currentBeat === 0 ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(envelope);
    envelope.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      timerRef.current = window.setInterval(playClick, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentBeat(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure, currentBeat]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-xl">
      <div className="mb-8">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Metrônomo Profissional</h3>
        <div className="text-7xl font-outfit font-black text-white mb-2">{bpm}</div>
        <div className="text-slate-500 font-medium">Batidas por Minuto</div>
      </div>

      <input 
        type="range" 
        min="40" 
        max="220" 
        value={bpm} 
        onChange={(e) => setBpm(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-8"
      />

      <div className="flex justify-center items-center gap-6 mb-8">
        {[...Array(beatsPerMeasure)].map((_, i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-100 ${
              isPlaying && (currentBeat - 1 + beatsPerMeasure) % beatsPerMeasure === i
                ? (i === 0 ? 'bg-orange-500 scale-125' : 'bg-slate-200 scale-110')
                : 'bg-slate-700'
            }`}
          ></div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play ml-1'}`}></i>
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        {[2, 3, 4, 6, 8].map(n => (
          <button 
            key={n}
            onClick={() => setBeatsPerMeasure(n)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              beatsPerMeasure === n ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {n}/4
          </button>
        ))}
      </div>
    </div>
  );
};

export default Metronome;
