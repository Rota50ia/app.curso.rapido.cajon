
import React, { useState, useEffect } from 'react';
import { supabase, APP_URL } from '../lib/supabase';

const AdminView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedLink('');
    
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      // Inserção com valores padrão para evitar erros de constraint no Postgres
      const { error } = await supabase
        .from('profiles')
        .insert([{
          email,
          nome,
          activation_token: token,
          token_expires_at: expiresAt.toISOString(),
          ativo: false,
          aulas_concluidas: 0,
          streak: 0,
          tempo_pratica_minutos: 0
        }]);

      if (error) {
        if (error.message.includes('duplicate key')) {
          throw new Error("Este e-mail já está cadastrado no sistema.");
        }
        throw error;
      }

      const link = `${APP_URL}?token=${token}`;
      setGeneratedLink(link);
      setEmail('');
      setNome('');
      fetchStudents();
    } catch (err: any) {
      alert("Erro ao cadastrar aluno: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#111218] border border-slate-800 rounded-[40px] p-8 md:p-10 shadow-2xl">
        <h2 className="text-3xl font-outfit font-black text-white mb-2">Painel do Instrutor</h2>
        <p className="text-slate-500 mb-8">Cadastre novos alunos e envie o link de ativação.</p>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">Nome Completo</label>
            <input 
              type="text" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 ml-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="aluno@email.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Gerar Convite de Acesso'}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl animate-in zoom-in-95">
            <p className="text-cyan-500 font-black text-sm uppercase mb-3">Convite Gerado com Sucesso!</p>
            <div className="flex gap-4">
              <input 
                readOnly 
                value={generatedLink} 
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-cyan-300 text-sm font-mono"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  alert("Link copiado!");
                }}
                className="bg-cyan-500 text-black px-6 rounded-xl font-bold hover:bg-cyan-400 transition-all"
              >
                Copiar
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-4 italic">Envie este link para o aluno. Ele terá 7 dias para definir a senha.</p>
          </div>
        )}
      </div>

      <div className="bg-[#111218] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800">
           <h3 className="text-xl font-outfit font-bold text-white">Alunos Cadastrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Aluno</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Progresso</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                        {student.nome?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{student.nome || 'Sem Nome'}</p>
                        <p className="text-slate-500 text-xs">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {student.ativo ? (
                      <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-md border border-green-500/20">ATIVO</span>
                    ) : (
                      <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-2 py-1 rounded-md border border-orange-500/20">PENDENTE</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${(student.aulas_concluidas / 45) * 100}%` }}></div>
                       </div>
                       <span className="text-xs text-slate-400">{student.aulas_concluidas || 0}/45</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs">
                    {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
