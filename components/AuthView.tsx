import React, { useState, useEffect } from 'react';
import { supabase, APP_URL } from '../lib/supabase';

const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Webhook n8n oficial
  const N8N_WEBHOOK_URL = 'https://edilson-dark-n8n.7lvlou.easypanel.host/webhook/confirma-cadastro';

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const isActivationMode = !!token;

  useEffect(() => {
    if (isActivationMode && token) {
      const fetchInviteData = async () => {
        try {
          const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('email, nome')
            .eq('activation_token', token)
            .single();
          
          if (data && !fetchError) {
            setEmail(data.email || '');
            setNome(data.nome || '');
          } else {
            setError("Este link de ativação expirou ou já foi utilizado.");
          }
        } catch (err) {
          console.error("Erro ao buscar convite:", err);
        }
      };
      fetchInviteData();
    }
  }, [isActivationMode, token]);

  // Função de notificação aprimorada para n8n
  const notifyN8N = async (tipo_evento: string) => {
    const payload = {
      email: email.toLowerCase().trim(),
      nome: nome || 'Aluno Cajón',
      token: token || null,
      tipo_evento: tipo_evento,
      timestamp: new Date().toISOString(),
      origem: 'app_cajon_frontend'
    };

    console.log(`[n8n Trigger] Enviando evento: ${tipo_evento}`, payload);

    // Usamos fetch de forma que não bloqueie o fluxo principal
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) console.warn(`[n8n Warning] Servidor retornou status ${response.status}`);
      else console.log(`[n8n Success] Evento ${tipo_evento} processado.`);
    })
    .catch(e => {
      console.error("[n8n Error] Falha de conexão ou CORS. Verifique se o n8n aceita requisições externas.", e);
    });
  };

  const translateError = (err: string) => {
    if (err.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (err.includes('User already registered')) return 'Este e-mail já possui uma conta ativa. Faça login.';
    if (err.includes('Password should be at least 6 characters')) return 'A senha deve ter no mínimo 6 caracteres.';
    if (err.includes('Email not confirmed')) return 'Por favor, confirme seu e-mail na sua caixa de entrada.';
    return 'Ocorreu um erro no servidor. Tente novamente.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Dispara em paralelo para não atrasar o login
      notifyN8N('tentativa_login');

      const { error: loginError, data } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          // Pequena espera para automações de ativação lenta
          await new Promise(r => setTimeout(r, 1500));
          const retry = await supabase.auth.signInWithPassword({ 
            email: email.toLowerCase().trim(), 
            password 
          });
          if (retry.error) throw retry.error;
        } else {
          throw loginError;
        }
      }

      if (data.user) notifyN8N('login_sucesso');

    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(), 
        password, 
        options: { 
          emailRedirectTo: APP_URL, 
          data: { nome, full_name: nome } 
        }
      });
      if (signUpError) throw signUpError;

      notifyN8N('novo_cadastro_manual');
      if (data.user && data.session === null) setSuccess(true);
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password.length < 6 || !email) return;
    setLoading(true);
    setError(null);
    try {
      notifyN8N('ativacao_iniciada');

      const { error: funcError } = await supabase.functions.invoke('activate-user', {
        body: { token, password, email, nome }
      });

      if (funcError) throw funcError;
      
      notifyN8N('ativacao_concluida_sucesso');
      setSuccess(true);
    } catch (err: any) {
      setError(translateError(err.message || 'Erro crítico na ativação.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mb-8 border border-cyan-500/30">
          <i className="fas fa-check text-4xl text-cyan-400"></i>
        </div>
        <h2 className="text-4xl font-outfit font-black text-white mb-4 uppercase tracking-tighter">
          {isActivationMode ? "Tudo Pronto! 🥁" : "Ação Necessária!"}
        </h2>
        <p className="text-slate-400 mb-10 max-w-sm text-sm leading-relaxed">
          {isActivationMode 
            ? "Sua conta foi ativada. Agora você pode entrar com sua nova senha."
            : "Enviamos um e-mail de confirmação. Clique no link enviado para liberar seu acesso."}
        </p>
        <button 
          onClick={() => { 
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload(); 
          }} 
          className="bg-white text-black px-12 py-5 rounded-[20px] font-black text-sm hover:bg-cyan-400 transition-all shadow-2xl uppercase tracking-widest active:scale-95"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 font-inter">
      <div className="relative mb-8 transform md:scale-110">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full scale-150"></div>
        <div className="relative w-24 h-28">
          <svg viewBox="0 0 200 240" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" fill="none">
            <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 60 L130 55 L130 185 L40 195 Z" fill="rgba(255,255,255,0.03)" />
              <path d="M130 55 L175 45 L175 170 L130 185 Z" fill="rgba(255,255,255,0.02)" />
              <path d="M40 60 L85 50 L175 45 L130 55 Z" fill="rgba(255,255,255,0.05)" />
              <circle cx="85" cy="125" r="30" fill="#0b0c11" strokeWidth="8" />
            </g>
          </svg>
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-outfit font-extrabold mb-10 text-center tracking-tight px-4">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text">
          Curso Rápido de Cajón
        </span>
      </h1>

      <div className="w-full max-w-md bg-[#111218] border border-slate-800/60 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-outfit font-bold text-white mb-2 uppercase tracking-tight">
            {isActivationMode ? "Ativar Meu Acesso" : (isSignUpMode ? "Novo Cadastro" : "Bem-vindo de Volta")}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span> Sincronizando n8n...</>
            ) : "Acesse o seu portal de aulas"}
          </p>
        </div>

        <form onSubmit={isActivationMode ? handleActivate : (isSignUpMode ? handleSignUp : handleLogin)} className="space-y-6">
          {(isSignUpMode || isActivationMode) && (
            <div>
              <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">Seu Nome</label>
              <input 
                type="text" 
                placeholder="Ex: Pedro Santos" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 text-slate-200 focus:border-cyan-500 outline-none transition-all text-sm" 
                required 
                readOnly={isActivationMode && !!nome}
              />
            </div>
          )}
          
          <div>
            <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className={`w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 text-slate-200 focus:border-cyan-500 outline-none transition-all text-sm ${isActivationMode ? 'opacity-60 cursor-not-allowed' : ''}`} 
              required 
              readOnly={isActivationMode}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">Sua Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 pr-14 text-slate-200 focus:border-cyan-500 outline-none transition-all text-sm" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 p-2"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-sm shadow-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50">
            {loading ? 'Aguarde...' : (isActivationMode ? 'Confirmar Ativação' : (isSignUpMode ? 'Criar Cadastro' : 'Entrar Agora'))}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake duration-300">
            <p className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        {!isActivationMode && (
          <div className="text-center mt-12">
            <p className="text-slate-500 text-[11px] font-bold">
              {isSignUpMode ? "Já tem uma conta?" : "Ainda não tem acesso?"}
              <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-cyan-400 font-black ml-2 hover:underline tracking-widest uppercase">
                {isSignUpMode ? "Login" : "Criar Senha"}
              </button>
            </p>
          </div>
        )}
      </div>
      <p className="mt-10 text-slate-700 text-[9px] font-medium uppercase tracking-[0.4em] opacity-40">Edilson Dark © 2024</p>
    </div>
  );
};

export default AuthView;