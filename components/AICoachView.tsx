
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Implement standard encode/decode as required by guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AICoachView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [transcripts, setTranscripts] = useState<string[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.close();
      setIsActive(false);
      setStatus('idle');
      return;
    }

    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Connected to Gemini Live');
            setStatus('active');
            setIsActive(true);

            // Audio Input streaming
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            if (message.serverContent?.outputTranscription) {
              setTranscripts(prev => [...prev.slice(-4), `Mentor: ${message.serverContent?.outputTranscription?.text}`]);
            }
          },
          onerror: (e) => console.error('Gemini error:', e),
          onclose: () => {
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "Você é um mentor especialista em Cajon. Seu objetivo é ajudar o aluno a aprender ritmos, corrigir técnica (bumbo, caixa, estalo) e dar feedback motivador. Você ouve o que o aluno toca e responde com dicas práticas. Seja encorajador e técnico.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
             status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-500'
           }`}>
             <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
             {status === 'active' ? 'Online' : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
           </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className={`w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-8 relative transition-all duration-500 ${
            status === 'active' ? 'ring-8 ring-orange-500/20' : ''
          }`}>
            <i className={`fas fa-robot text-5xl transition-colors ${status === 'active' ? 'text-orange-500' : 'text-slate-600'}`}></i>
            {status === 'active' && (
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping opacity-25"></div>
            )}
          </div>

          <h2 className="text-2xl font-outfit font-bold text-white mb-2">Mentor de Cajon IA</h2>
          <p className="text-slate-400 text-center max-w-sm mb-10 leading-relaxed">
            Inicie uma conversa por voz. Toque seu cajon, peça ritmos ou tire dúvidas técnicas em tempo real.
          </p>

          <button 
            onClick={toggleSession}
            disabled={status === 'connecting'}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
              isActive 
                ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-900/20'
            }`}
          >
            {isActive ? 'Encerrar Sessão' : status === 'connecting' ? 'Preparando...' : 'Começar a Treinar'}
          </button>
        </div>

        <div className="border-t border-slate-800 pt-6 mt-4 min-h-[120px]">
          <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Transcrição ao Vivo</p>
          <div className="space-y-3">
            {transcripts.length === 0 ? (
              <p className="text-slate-600 text-sm italic">O mentor está ouvindo seus golpes...</p>
            ) : (
              transcripts.map((t, idx) => (
                <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 animate-in slide-in-from-bottom-2">
                  <p className="text-sm text-slate-300">{t}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <i className="fas fa-lightbulb text-blue-500"></i>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold">Dica: "Como faço o som de caixa?"</h4>
            <p className="text-slate-500 text-xs">Pergunte isso para aprender a técnica de estalo.</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <i className="fas fa-music text-purple-500"></i>
          </div>
          <div>
            <h4 className="text-white text-sm font-bold">Toque um ritmo de Rock</h4>
            <p className="text-slate-500 text-xs">A IA pode identificar seu tempo e sugerir variações.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachView;
