
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

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const isActivationMode = !!token;

  const translateError = (err: string) => {
    if (err.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (err.includes('User already registered')) return 'E-mail já cadastrado.';
    if (err.includes('Password should be at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (err.includes('Email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada.';
    return err;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
      const { error, data } = await supabase.auth.signUp({
        email, 
        password, 
        options: { 
          emailRedirectTo: APP_URL, 
          data: { nome: nome || 'Aluno' } 
        }
      });
      if (error) throw error;
      if (data.user && data.session === null) setSuccess(true);
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
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
      // Invocação via SDK: resolve problemas de CORS e autenticação da função
      const { data, error: funcError } = await supabase.functions.invoke('activate-user', {
        body: { token, password, email }
      });

      if (funcError) throw funcError;
      if (data && data.error) throw new Error(data.error);

      setSuccess(true);
    } catch (err: any) {
      console.error('Erro de Ativação:', err);
      setError(err.message || 'Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <i className="fas fa-check text-2xl text-green-500"></i>
        </div>
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">
          {isActivationMode ? "Conta ativada! 🎉" : "Verifique seu e-mail"}
        </h2>
        <p className="text-slate-400 mb-8 max-w-sm leading-relaxed text-sm">
          {isActivationMode 
            ? "Sua conta está pronta. Agora você pode entrar e começar seus treinos de Cajon."
            : "Enviamos um link de confirmação para o seu e-mail. Clique nele para liberar seu acesso."}
        </p>
        <button 
          onClick={() => { 
            setSuccess(false); 
            setIsSignUpMode(false); 
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload(); 
          }} 
          className="bg-white text-black px-8 py-3.5 rounded-xl font-black text-base hover:bg-slate-200 transition-colors shadow-xl"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 font-inter overflow-x-hidden">
      {/* Logo Refinado com Brilho Neon */}
      <div className="relative mb-4 transform scale-[0.75] md:scale-95 transition-transform">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full scale-125"></div>
        <div className="relative w-24 h-28 flex items-center justify-center">
          <svg viewBox="0 0 200 240" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 60 L130 55 L130 185 L40 195 Z" fill="rgba(255,255,255,0.03)" />
              <path d="M130 55 L175 45 L175 170 L130 185 Z" fill="rgba(255,255,255,0.02)" />
              <path d="M40 60 L85 50 L175 45 L130 55 Z" fill="rgba(255,255,255,0.05)" />
              <path d="M45 194.5 L45 202 L60 202 L60 193" />
              <path d="M125 186 L125 195 L140 195 L140 183" />
              <path d="M165 172 L165 182 L180 182 L180 169" />
              <circle cx="85" cy="125" r="30" fill="#0b0c11" strokeWidth="8" />
              <g fill="white" stroke="none">
                <circle cx="45" cy="65" r="2.5" /><circle cx="68" cy="63" r="2.5" /><circle cx="91" cy="61" r="2.5" /><circle cx="114" cy="59" r="2.5" /><circle cx="125" cy="58" r="2.5" />
                <circle cx="125" cy="85" r="2.5" /><circle cx="125" cy="115" r="2.5" /><circle cx="125" cy="145" r="2.5" /><circle cx="125" cy="175" r="2.5" />
                <circle cx="45" cy="190" r="2.5" /><circle cx="68" cy="188" r="2.5" /><circle cx="91" cy="186" r="2.5" /><circle cx="114" cy="184" r="2.5" />
                <circle cx="45" cy="95" r="2.5" /><circle cx="45" cy="125" r="2.5" /><circle cx="45" cy="155" r="2.5" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <h1 className="text-2xl md:text-5xl font-outfit font-extrabold mb-1 text-center tracking-tight px-4 leading-tight">
        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
          Curso Rápido de Cajón
        </span>
      </h1>
      <p className="text-slate-400 text-[11px] md:text-lg mb-8 font-medium italic opacity-80">Pratique Seus Ritmos Aqui</p>

      <div className="w-full max-w-md bg-[#111218] border border-slate-800/60 rounded-[32px] md:rounded-[40px] p-7 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-3xl font-outfit font-bold text-white mb-1 md:mb-2 uppercase tracking-tight">
            {isActivationMode ? "Ativar Acesso" : (isSignUpMode ? "Criar Minha Conta" : "Bem-vindo")}
          </h2>
          <p className="text-slate-500 text-[11px] md:text-sm font-medium">
            {isActivationMode ? "Defina sua senha para começar" : (isSignUpMode ? "Cadastre-se para as aulas" : "Acesse seu painel de estudos")}
          </p>
        </div>

        <form onSubmit={isActivationMode ? handleActivate : (isSignUpMode ? handleSignUp : handleLogin)} className="space-y-5">
          {isSignUpMode && (
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 ml-1 text-[10px] uppercase tracking-widest">Nome Completo</label>
              <input type="text" placeholder="Seu Nome" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-3.5 px-5 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-800 text-sm" required />
            </div>
          )}
          
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 ml-1 text-[10px] uppercase tracking-widest">E-mail</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-3.5 px-5 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-800 text-sm" required />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5 ml-1 text-[10px] uppercase tracking-widest">Senha (6+ caracteres)</label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#0d0e13] border border-slate-800 rounded-2xl py-3.5 px-5 pr-14 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder:text-slate-800 text-sm" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 focus:text-cyan-400 transition-all duration-300 p-2 z-10"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm md:text-base`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-[#08090d] py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg shadow-[0_15px_30px_-5px_rgba(59,130,246,0.3)] hover:brightness-110 hover:shadow-cyan-500/20 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest">
            {loading ? 'Processando...' : (isActivationMode ? 'Ativar Conta' : (isSignUpMode ? 'Criar Acesso' : 'Entrar'))}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-[9px] text-center font-bold leading-tight uppercase tracking-widest">{error}</p>
          </div>
        )}

        {!isActivationMode && (
          <div className="text-center mt-10">
            <p className="text-slate-500 text-[11px] md:text-xs font-semibold">
              {isSignUpMode ? "Já possui uma senha?" : "Ainda não tem acesso?"}
              <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-cyan-400 font-black ml-2 hover:underline decoration-cyan-400/40 underline-offset-4 tracking-wide">
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
