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

  // Webhook n8n oficial fornecido pelo usuário
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
            setError("Link de ativação inválido ou já utilizado.");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do convite", err);
        }
      };
      fetchInviteData();
    }
  }, [isActivationMode, token]);

  // Função centralizada para notificar a automação n8n conforme especificado
  const notifyN8N = async (tipo_evento: string) => {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          nome: nome,
          token: token || null,
          tipo_evento: tipo_evento,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn("N8N Webhook não respondeu, mas prosseguindo...", e);
    }
  };

  const translateError = (err: string) => {
    if (err.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (err.includes('User already registered')) return 'Conta já cadastrada! Tente fazer login.';
    if (err.includes('Password should be at least 6 characters')) return 'A senha deve ter 6+ caracteres.';
    if (err.includes('Email not confirmed')) return 'Confirme seu e-mail antes de acessar.';
    return err;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: loginError, data } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      if (data.user) {
        await notifyN8N('login_realizado');
      }
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

      // Gatilho n8n: Novo cadastro
      await notifyN8N('novo_cadastro');

      if (data.user && data.session === null) setSuccess(true);
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password.length < 6 || !email) {
      if (!email) setError('E-mail não encontrado no link.');
      if (password.length < 6) setError('Senha muito curta.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Gatilho n8n: Início da ativação
      await notifyN8N('ativacao_solicitada');

      const { error: funcError } = await supabase.functions.invoke('activate-user', {
        body: { token, password, email, nome }
      });

      if (funcError) throw funcError;
      
      // Gatilho n8n: Ativação concluída
      await notifyN8N('ativacao_concluida');

      setSuccess(true);
    } catch (err: any) {
      setError(translateError(err.message || 'Erro na ativação.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-cyan-500/30">
          <i className="fas fa-check text-3xl text-cyan-400"></i>
        </div>
        <h2 className="text-3xl font-outfit font-black text-white mb-3">
          {isActivationMode ? "Ativação Concluída! 🚀" : "Verifique seu E-mail"}
        </h2>
        <p className="text-slate-400 mb-10 max-w-sm leading-relaxed text-sm">
          {isActivationMode 
            ? "Seu acesso foi ativado e o n8n sincronizou seus dados. Clique abaixo para entrar."
            : "Enviamos um link de confirmação. Por favor, clique nele para ativar seu acesso às aulas."}
        </p>
        <button 
          onClick={() => { 
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload(); 
          }} 
          className="bg-white text-black px-10 py-4 rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all shadow-xl uppercase tracking-widest"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 font-inter">
      {/* Branding */}
      <div className="relative mb-6 transform md:scale-110">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[50px] rounded-full scale-150"></div>
        <div className="relative w-28 h-32 flex items-center justify-center">
          <svg viewBox="0 0 200 240" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 60 L130 55 L130 185 L40 195 Z" fill="rgba(255,255,255,0.03)" />
              <path d="M130 55 L175 45 L175 170 L130 185 Z" fill="rgba(255,255,255,0.02)" />
              <path d="M40 60 L85 50 L175 45 L130 55 Z" fill="rgba(255,255,255,0.05)" />
              <circle cx="85" cy="125" r="30" fill="#0b0c11" strokeWidth="8" />
            </g>
          </svg>
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-outfit font-extrabold mb-10 text-center tracking-tight px-4 leading-tight">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
          Curso Rápido de Cajón
        </span>
      </h1>

      <div className="w-full max-w-md bg-[#111218] border border-slate-800/60 rounded-[40px] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-outfit font-bold text-white mb-2 uppercase tracking-tight">
            {isActivationMode ? "Ativar Acesso" : (isSignUpMode ? "Criar Conta" : "Login")}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
              {loading ? "Sincronizando com n8n..." : "Acesse suas lições"}
            </p>
          </div>
        </div>

        <form onSubmit={isActivationMode ? handleActivate : (isSignUpMode ? handleSignUp : handleLogin)} className="space-y-6">
          {(isSignUpMode || isActivationMode) && (
            <div>
              <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">Seu Nome</label>
              <input 
                type="text" 
                placeholder="Ex: João Silva" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 text-slate-200 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-800 text-sm font-medium" 
                required 
                readOnly={isActivationMode && !!nome}
              />
            </div>
          )}
          
          <div>
            <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">Seu E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className={`w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 text-slate-200 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-800 text-sm font-medium ${isActivationMode ? 'opacity-60 cursor-not-allowed' : ''}`} 
              required 
              readOnly={isActivationMode}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-black mb-2 ml-1 text-[10px] uppercase tracking-widest">Senha</label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-4 px-6 pr-14 text-slate-200 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-800 text-sm font-medium" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 p-2 z-10"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-sm md:text-lg shadow-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50">
            {loading ? 'Processando...' : (isActivationMode ? 'Ativar Agora' : (isSignUpMode ? 'Criar Acesso' : 'Entrar'))}
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
              {isSignUpMode ? "Já tem acesso?" : "Ainda não tem conta?"}
              <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-cyan-400 font-black ml-2 hover:underline tracking-widest uppercase text-[10px]">
                {isSignUpMode ? "Fazer Login" : "Cadastrar Agora"}
              </button>
            </p>
          </div>
        )}
      </div>
      
      <p className="mt-10 text-slate-700 text-[10px] font-medium uppercase tracking-[0.3em] opacity-40 italic">Edilson Dark © 2024</p>
    </div>
  );
};

export default AuthView;