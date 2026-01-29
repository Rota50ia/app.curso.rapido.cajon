
import React, { useState, useEffect, useRef } from 'react';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTapRef = useRef<number>(0);

  const playClick = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    const isFirstBeat = currentBeat === 0;
    osc.frequency.value = isFirstBeat ? 1200 : 800;
    envelope.gain.value = isFirstBeat ? 0.6 : 0.3;
    envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, bpm, beatsPerMeasure, currentBeat]);

  const handleTap = () => {
    const now = Date.now();
    const diff = now - lastTapRef.current;
    if (diff > 250 && diff < 2000) {
      const newBpm = Math.round(60000 / diff);
      if (newBpm >= 40 && newBpm <= 240) setBpm(newBpm);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="bg-[#111218] border border-white/[0.03] p-6 md:p-12 rounded-[32px] md:rounded-[50px] shadow-3xl relative overflow-hidden">
      <div className="relative z-10 flex flex-col gap-8 md:gap-12">
        <div className="text-center">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 block">TEMPO BPM</span>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-7xl md:text-9xl font-outfit font-black tracking-tighter transition-all ${isPlaying ? 'text-white' : 'text-slate-800'}`}>
              {bpm}
            </span>
            <div className="flex flex-col items-start">
               <span className="text-cyan-500 font-black text-lg italic">BPM</span>
               <div className={`w-3 h-3 rounded-full mt-1 ${isPlaying ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800'}`}></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 flex-wrap px-2">
          {[...Array(beatsPerMeasure)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 md:h-2 flex-1 max-w-[40px] rounded-full transition-all duration-100 ${
                isPlaying && (currentBeat - 1 + beatsPerMeasure) % beatsPerMeasure === i
                  ? (i === 0 ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white') 
                  : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>

        <div className="space-y-8">
          <input 
            type="range" min="40" max="240" value={bpm} 
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer accent-white"
          />

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleTap}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 active:text-cyan-400 active:scale-90 transition-all"
              >
                <i className="fas fa-fingerprint text-xl"></i>
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all active:scale-90 shadow-2xl ${
                  isPlaying ? 'bg-white text-black' : 'bg-cyan-500 text-white'
                }`}
              >
                <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play ml-1'}`}></i>
              </button>

              <div className="flex flex-col gap-2">
                {[4, 3, 2].map(v => (
                  <button 
                    key={v} onClick={() => setBeatsPerMeasure(v)}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black border transition-all ${beatsPerMeasure === v ? 'bg-white text-black border-white' : 'bg-slate-900 text-slate-600 border-white/5'}`}
                  >
                    {v}/4
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metronome;
