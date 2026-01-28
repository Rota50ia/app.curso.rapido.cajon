import React, { useState, useEffect } from 'react';
import { supabase, APP_URL } from '../lib/supabase';

const AdminView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [students, setStudents] = useState<any[]>([]);

  const N8N_WEBHOOK_URL = 'https://edilson-dark-n8n.7lvlou.easypanel.host/webhook/confirma-cadastro';

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
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
      const { error } = await supabase
        .from('profiles')
        .insert([{
          email: email.toLowerCase().trim(),
          nome,
          activation_token: token,
          token_expires_at: expiresAt.toISOString(),
          ativo: false,
          aulas_concluidas: 0,
          streak: 0,
          tempo_pratica_minutos: 0
        }]);

      if (error) {
        if (error.message.includes('duplicate key')) throw new Error("Este e-mail já existe no banco.");
        throw error;
      }

      const link = `${APP_URL}/?token=${token}`;
      setGeneratedLink(link);

      // Notificação para o n8n
      const n8nPayload = {
        email: email.toLowerCase().trim(),
        nome,
        token,
        link_ativacao: link,
        tipo_evento: 'convite_gerado_admin',
        timestamp: new Date().toISOString()
      };

      console.log("[Admin n8n] Enviando convite...", n8nPayload);

      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(n8nPayload)
      })
      .then(res => console.log("[Admin n8n] Resposta do servidor:", res.status))
      .catch(err => console.error("[Admin n8n Error] Falha de rede ou CORS:", err));

      setEmail('');
      setNome('');
      fetchStudents();
    } catch (err: any) {
      alert("Erro Admin: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-[#111218] border border-slate-800 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full"></div>
        <h2 className="text-3xl font-outfit font-black text-white mb-2">Painel de Gestão</h2>
        <p className="text-slate-500 mb-8 text-sm">Cadastre alunos e envie convites vinculados ao seu n8n.</p>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Nome do Aluno</label>
            <input 
              type="text" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">E-mail de Acesso</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="aluno@email.com"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-5 rounded-2xl font-black text-base hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Gerar Convite & Notificar n8n'}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl animate-in zoom-in-95">
            <p className="text-cyan-500 font-black text-[10px] uppercase mb-3 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></span>
              Link Gerado! O n8n foi notificado para disparar o e-mail.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                readOnly 
                value={generatedLink} 
                className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 text-cyan-300 text-xs font-mono break-all outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  alert("Link copiado!");
                }}
                className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-cyan-400 transition-all whitespace-nowrap text-sm"
              >
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#111218] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
           <h3 className="text-xl font-outfit font-bold text-white uppercase tracking-tighter">Alunos na Base</h3>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{students.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Informações</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status n8n</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Aulas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-cyan-500 group-hover:border-cyan-500/50 transition-all">
                        {student.nome?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm leading-none mb-1">{student.nome || 'Sem Nome'}</p>
                        <p className="text-slate-500 text-[10px] font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {student.ativo ? (
                      <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-widest">Ativo</span>
                    ) : (
                      <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-2.5 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">Pendente</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${Math.min((student.aulas_concluidas / 45) * 100, 100)}%` }}></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-400">{student.aulas_concluidas || 0}/45</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'N/A'}
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