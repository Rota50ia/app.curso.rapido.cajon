
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AICoachViewProps {
  profile?: any;
}

const AICoachView: React.FC<AICoachViewProps> = ({ profile }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [serverReply, setServerReply] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const BASE_URL = 'https://edilson-dark-n8n.7lvlou.easypanel.host';
  const ENDPOINT = isTestMode ? '/webhook-test/mentor-ia-app-curso-rapido-cajon' : '/webhook/mentor-ia-app-curso-rapido-cajon';
  const N8N_WEBHOOK_URL = `${BASE_URL}${ENDPOINT}`;

  const saveToHistory = async (userMsg: string, aiReply: string) => {
    if (!profile?.id) return;
    try {
      await addDoc(collection(db, "interacoes"), {
        userId: profile.id,
        userEmail: profile.email,
        pergunta: userMsg,
        resposta: aiReply,
        timestamp: serverTimestamp(),
        contexto: 'mentor_cajon'
      });
      console.log("Interação salva no datastore.");
    } catch (e) {
      console.error("Erro ao salvar histórico:", e);
    }
  };

  const triggerMentor = async () => {
    if (status === 'sending' || !message.trim()) return;
    
    setStatus('sending');
    setServerReply(null);
    setDebugInfo(isSimulated ? "Simulando resposta local..." : "Conectando ao n8n...");

    const userMsgCopy = message.trim();

    if (isSimulated) {
      setTimeout(async () => {
        const simReply = "Salve! Esta é uma resposta de teste simulada. Quando o n8n estiver configurado, você verá a resposta real da IA aqui!";
        setServerReply(simReply);
        setStatus('success');
        setMessage('');
        setDebugInfo(null);
        await saveToHistory(userMsgCopy, simReply);
      }, 1500);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const payload = {
      email: profile?.email || 'aluno@teste.com',
      nome: profile?.nome || 'Cajoneiro',
      mensagem: userMsgCopy,
      tipo_evento: 'solicitacao_mentor_ia',
      timestamp: new Date().toISOString(),
      origem: 'aba_mentor_app'
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const rawData = await response.text();

      if (!response.ok) throw new Error(`Erro ${response.status}: ${rawData.substring(0, 50)}`);

      let replyText = rawData;
      if (rawData) {
        try {
          const jsonResponse = JSON.parse(rawData);
          replyText = jsonResponse.mensagem || jsonResponse.reply || jsonResponse.text || JSON.stringify(jsonResponse);
        } catch (e) {
          replyText = rawData;
        }
      } else {
        replyText = "Mensagem enviada! Aguardando o mentor processar...";
      }

      setServerReply(replyText);
      setStatus('success');
      setDebugInfo(null);
      setMessage('');
      
      // Salva no Firestore
      await saveToHistory(userMsgCopy, replyText);

      setTimeout(() => {
        setStatus('idle');
        setServerReply(null);
      }, 15000);

    } catch (err: any) {
      clearTimeout(timeoutId);
      setStatus('error');
      setDebugInfo(err.name === 'AbortError' ? "Tempo esgotado (n8n lento)" : err.message);
      setTimeout(() => setStatus('idle'), 6000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 animate-in fade-in duration-700 px-4">
      <div className="w-full max-w-2xl bg-[#111218] border border-slate-800/50 rounded-[50px] p-8 md:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] text-center relative overflow-hidden group">
        
        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 pointer-events-none ${
          status === 'success' ? 'bg-green-500/20' : status === 'error' ? 'bg-red-500/20' : 'bg-cyan-500/10'
        }`}></div>

        <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
          <button 
            onClick={() => setIsTestMode(!isTestMode)}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
              isTestMode ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-slate-800 text-slate-600'
            }`}
          >
            {isTestMode ? 'WEBHOOK TEST' : 'PRODUÇÃO'}
          </button>
          <button 
            onClick={() => setIsSimulated(!isSimulated)}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
              isSimulated ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5' : 'border-slate-800 text-slate-800'
            }`}
          >
            {isSimulated ? 'SIMULAÇÃO ON' : 'SIMULAÇÃO OFF'}
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div 
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl ${
              status === 'success' ? 'bg-green-500/10 border-2 border-green-500' : 
              status === 'error' ? 'bg-red-500/10 border-2 border-red-500' : 'bg-cyan-500/10 border-2 border-cyan-500/50'
            }`}
          >
            <i className={`fas ${
              status === 'sending' ? 'fa-spinner fa-spin text-cyan-400' :
              status === 'success' ? 'fa-comment-dots text-green-500' : 
              status === 'error' ? 'fa-exclamation-triangle text-red-500' : 'fa-robot text-cyan-400'
            } text-3xl md:text-4xl`}></i>
          </div>

          <h2 className="text-3xl md:text-4xl font-outfit font-semibold text-white mb-4 uppercase italic tracking-normal">
            {status === 'success' ? 'Dica do Mentor' : status === 'error' ? 'Erro de Conexão' : 'MENTOR CAJONEIRO'}
          </h2>
          
          <div className="min-h-[100px] flex flex-col items-center justify-center mb-8 px-4 w-full">
            {status === 'success' ? (
              <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-3xl w-full animate-in zoom-in-95 shadow-inner">
                <p className="text-cyan-100 text-sm md:text-base leading-relaxed italic font-medium">
                  "{serverReply}"
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium max-w-md">
                Dúvida técnica ou sugestão de treino? Pergunte ao nosso mentor inteligente (Sua interação será salva):
              </p>
            )}
            
            {debugInfo && (
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">{debugInfo}</span>
              </div>
            )}
          </div>

          <div className={`w-full relative mb-8 transition-all duration-500 ${status === 'success' ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === 'sending'}
              placeholder="Ex: Qual a melhor pegada para o som de bumbo?"
              className="w-full h-32 md:h-40 bg-black/40 border border-slate-800 rounded-3xl p-6 text-white text-sm md:text-base focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700 resize-none font-medium"
            />
          </div>

          <button 
            onClick={triggerMentor}
            disabled={status === 'sending' || status === 'success' || !message.trim()}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 ${
              status === 'sending' ? 'bg-slate-800 text-slate-500' :
              status === 'success' ? 'bg-green-600 text-white' :
              status === 'error' ? 'bg-red-600 text-white hover:bg-red-500' :
              message.trim() ? 'bg-cyan-500 text-white hover:bg-cyan-400 hover:shadow-cyan-900/30' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            {status === 'sending' ? 'PROCESSANDO...' : status === 'success' ? 'DICA RECEBIDA' : 'FALAR COM MENTOR'}
          </button>
          
          <p className="mt-8 text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em]">
            Tecnologia de Resposta Instantânea via n8n & Firestore
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoachView;
