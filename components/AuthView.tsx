
import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';

const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const translateError = (err: string) => {
    if (err.includes('auth/invalid-credential') || err.includes('auth/wrong-password')) return 'E-mail ou senha incorretos.';
    if (err.includes('auth/user-not-found')) return 'Usuário não encontrado.';
    if (err.includes('auth/email-already-in-use')) return 'E-mail já cadastrado.';
    if (err.includes('auth/weak-password')) return 'Senha muito fraca (mínimo 6 caracteres).';
    return 'Ocorreu um erro no acesso. Tente novamente.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      // Opcional: Aqui poderíamos salvar o nome no perfil do Firebase, mas o Firebase Auth 
      // padrão usa display name.
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(translateError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 py-8">
      {/* Logo Section compactada para mobile */}
      <div className="mb-6 transform scale-75 md:scale-100 relative">
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
        <div className="w-16 h-20 relative mx-auto z-10">
          <svg viewBox="0 0 200 240" fill="none">
            <g stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 60 L130 55 L130 185 L40 195 Z" fill="rgba(255,255,255,0.03)" />
              <path d="M130 55 L175 45 L175 170 L130 185 Z" fill="rgba(255,255,255,0.01)" />
              <path d="M40 60 L85 50 L175 45 L130 55 Z" fill="rgba(255,255,255,0.05)" />
              <circle cx="85" cy="125" r="30" fill="#08090d" strokeWidth="8" />
            </g>
          </svg>
        </div>
      </div>

      <h1 className="text-2xl md:text-5xl font-outfit font-black mb-8 text-center tracking-tighter px-2 italic uppercase">
        <span className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-transparent bg-clip-text leading-tight block">
          CURSO RÁPIDO DE CAJÓN
        </span>
      </h1>

      <div className="w-full max-w-[380px] bg-[#0b0c11] border border-white/[0.05] rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-outfit font-extrabold text-white mb-1 uppercase tracking-tight">
            {isSignUpMode ? "CRIAR ACESSO" : "BEM-VINDO"}
          </h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">
            {isSignUpMode ? "CRIE SUA CONTA AGORA" : "ACESSE O SEU PORTAL DE ÁUDIOS"}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-full font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            ENTRAR COM GOOGLE
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-white/5 flex-1"></div>
            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">OU E-MAIL</span>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>
        </div>

        <form onSubmit={isSignUpMode ? handleSignUp : handleLogin} className="space-y-5">
          {isSignUpMode && (
            <div>
              <label className="block text-slate-500 font-bold mb-1.5 ml-1 text-[9px] uppercase tracking-[0.2em]">NOME</label>
              <input 
                type="text" 
                placeholder="Seu nome" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                className="w-full bg-[#08090d] border border-white/[0.08] rounded-full py-2.5 px-5 text-slate-200 focus:border-cyan-500/50 outline-none transition-all text-sm placeholder:text-slate-800" 
                required 
              />
            </div>
          )}
          
          <div>
            <label className="block text-slate-500 font-bold mb-1.5 ml-1 text-[9px] uppercase tracking-[0.2em]">E-MAIL</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-[#08090d] border border-cyan-500/20 rounded-full py-2.5 px-5 text-slate-200 focus:border-cyan-500 outline-none transition-all text-sm placeholder:text-slate-800" 
              required 
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1.5 ml-1 text-[9px] uppercase tracking-[0.2em]">SENHA</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#08090d] border border-white/[0.08] rounded-full py-2.5 px-5 pr-12 text-slate-200 focus:border-cyan-500/50 outline-none transition-all text-sm placeholder:text-slate-800" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 active:text-cyan-400"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#22d3ee] to-[#2563eb] text-white py-3.5 rounded-full font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 mt-4">
            {loading ? 'CARREGANDO...' : (isSignUpMode ? 'CRIAR CONTA' : 'ENTRAR AGORA')}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-[9px] text-center font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-slate-500 text-[9px] font-bold uppercase tracking-widest active:text-cyan-400">
            {isSignUpMode ? "JÁ TENHO CONTA" : "AINDA NÃO TEM ACESSO? CADASTRAR"}
          </button>
        </div>
      </div>
      <p className="mt-10 text-slate-900 text-[9px] font-black uppercase tracking-[0.4em] opacity-30">ROTA 50 IA © 2024</p>
    </div>
  );
};

export default AuthView;
