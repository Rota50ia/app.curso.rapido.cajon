
import React, { useState, useEffect } from 'react';
import { supabase, APP_URL } from '../lib/supabase';

const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const isActivationMode = !!token;

  const translateError = (err: string) => {
    if (err.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (err.includes('User already registered')) return 'E-mail já cadastrado.';
    if (err.includes('Password should be at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
    return err;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(translateError(error.message)); setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: APP_URL, data: { nome: nome || 'Aluno' } }
    });
    if (error) { setError(translateError(error.message)); setLoading(false); }
    else if (data.user) { if (data.session === null) setSuccess(true); setLoading(false); }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password.length < 6) {
      if (password.length < 6) setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://ctvdlamxicoxniyqcpfd.functions.supabase.co/activate-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao ativar conta');
      setSuccess(true);
    } catch (err: any) { setError(err.message || 'Erro ao ativar conta'); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <i className="fas fa-envelope-open-text text-4xl text-green-500"></i>
        </div>
        <h2 className="text-3xl font-outfit font-bold text-white mb-4">
          {isActivationMode ? "Conta ativada! 🎉" : "Verifique seu e-mail"}
        </h2>
        <p className="text-slate-400 mb-10 max-w-sm leading-relaxed">
          {isActivationMode 
            ? "Sua conta está pronta. Agora você pode entrar e começar seus treinos de Cajon."
            : "Enviamos um link de confirmação para o seu e-mail. Clique nele para liberar seu acesso."}
        </p>
        <button 
          onClick={() => { setSuccess(false); setIsSignUpMode(false); window.history.replaceState({}, document.title, window.location.pathname); }} 
          className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors shadow-xl"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-6 font-inter overflow-x-hidden">
      {/* Logo Original Restaurado */}
      <div className="relative mb-8 transform scale-90 md:scale-100">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full scale-150"></div>
        <div className="relative w-32 h-40 flex items-center justify-center">
          <svg viewBox="0 0 200 240" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 60 L130 55 L130 185 L40 195 Z" />
              <path d="M130 55 L175 45 L175 170 L130 185 Z" />
              <path d="M40 60 L85 50 L175 45 L130 55 Z" />
              <path d="M45 194.5 L45 202 L60 202 L60 193" />
              <path d="M125 186 L125 195 L140 195 L140 183" />
              <path d="M165 172 L165 182 L180 182 L180 169" />
              <circle cx="85" cy="125" r="30" fill="#08090d" strokeWidth="4" />
              <g fill="white" stroke="none">
                <circle cx="45" cy="65" r="1.5" /><circle cx="68" cy="63" r="1.5" /><circle cx="91" cy="61" r="1.5" /><circle cx="114" cy="59" r="1.5" /><circle cx="125" cy="58" r="1.5" />
                <circle cx="125" cy="85" r="1.5" /><circle cx="125" cy="115" r="1.5" /><circle cx="125" cy="145" r="1.5" /><circle cx="125" cy="175" r="1.5" />
                <circle cx="45" cy="190" r="1.5" /><circle cx="68" cy="188" r="1.5" /><circle cx="91" cy="186" r="1.5" /><circle cx="114" cy="184" r="1.5" />
                <circle cx="45" cy="95" r="1.5" /><circle cx="45" cy="125" r="1.5" /><circle cx="45" cy="155" r="1.5" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-outfit font-extrabold mb-2 text-center tracking-tight">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
          Curso Rápido de Cajón
        </span>
      </h1>
      <p className="text-slate-500 text-sm md:text-lg mb-10 font-medium italic">Pratique Seus Ritmos Aqui</p>

      <div className="w-full max-w-md bg-[#111218] border border-slate-800/50 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-outfit font-bold text-white mb-2 uppercase tracking-tight">
            {isActivationMode ? "Ativar Acesso" : (isSignUpMode ? "Criar Minha Conta" : "Bem-vindo")}
          </h2>
          <p className="text-slate-500 text-sm">
            {isActivationMode ? "Defina sua senha para começar" : (isSignUpMode ? "Cadastre-se para as aulas" : "Acesse seu painel de estudos")}
          </p>
        </div>

        <form onSubmit={isActivationMode ? handleActivate : (isSignUpMode ? handleSignUp : handleLogin)} className="space-y-5">
          {isSignUpMode && (
            <div>
              <label className="block text-white font-bold mb-2 ml-1 text-sm">Nome Completo</label>
              <input type="text" placeholder="Seu Nome" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-[#0d0e13] border border-slate-800 rounded-[20px] py-4 px-6 text-slate-300 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-medium" required />
            </div>
          )}
          <div>
            <label className="block text-white font-bold mb-2 ml-1 text-sm">E-mail</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0d0e13] border border-slate-800 rounded-[20px] py-4 px-6 text-slate-300 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-medium" required />
          </div>
          <div>
            <label className="block text-white font-bold mb-2 ml-1 text-sm">Senha (6+ caracteres)</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0d0e13] border border-slate-800 rounded-[20px] py-4 px-6 text-slate-300 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-medium" required minLength={6} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#00f2fe] via-[#7d5dfc] to-[#f53fbd] text-[#08090d] py-5 rounded-[20px] font-black text-lg shadow-[0_10px_20px_rgba(125,93,252,0.3)] hover:brightness-110 transition-all active:scale-[0.97] mt-4">
            {loading ? 'Processando...' : (isActivationMode ? 'Ativar Conta' : (isSignUpMode ? 'Criar Acesso' : 'Entrar'))}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-500 text-[10px] text-center font-bold leading-tight uppercase tracking-widest">{error}</p>
          </div>
        )}

        {!isActivationMode && (
          <div className="text-center mt-10">
            <p className="text-slate-500 text-sm font-medium">
              {isSignUpMode ? "Já possui uma senha?" : "Ainda não tem acesso?"}
              <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-cyan-400 font-bold ml-2 hover:underline decoration-cyan-400/30 underline-offset-4">
                {isSignUpMode ? "Fazer Login" : "Criar Senha"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
