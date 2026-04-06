import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, ShieldCheck, CreditCard, RefreshCcw, CheckCircle2, Loader2 } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUserData();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
    }
    setUpdating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CARD DE IDENTIDADE */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-primary flex items-center justify-center rounded-3xl shadow-lg shadow-primary/20">
          <span className="text-3xl font-black text-black">{user?.email?.substring(0, 2).toUpperCase()}</span>
        </div>
        <div className="text-center md:text-left flex-1">
          <h3 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white">Perfil Operacional</h3>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Conta Ativa
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SEGURANÇA */}
        <section className="bg-white dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-primary"><Lock className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest">Segurança</h4>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nova Senha</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/10 p-4 rounded-2xl outline-none focus:border-primary text-sm"
                placeholder="Introduza a nova senha"
              />
            </div>
            {message.text && (
              <div className={`p-4 rounded-xl text-[10px] font-black uppercase ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.text}
              </div>
            )}
            <button disabled={updating} className="w-full py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
              {updating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Atualizar Credenciais'}
            </button>
          </form>
        </section>

        {/* SUBSCRIÇÃO */}
        <section className="bg-white dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-primary"><CreditCard className="w-5 h-5" /></div>
            <h4 className="text-sm font-black uppercase tracking-widest">Assinatura</h4>
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem]">
            <p className="text-[10px] font-black text-primary uppercase mb-1">Status do Plano</p>
            <h5 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">Operacional Pro</h5>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400"><CheckCircle2 className="w-3 h-3 text-primary" /> Acesso Total PC-BA</li>
              <li className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400"><CheckCircle2 className="w-3 h-3 text-primary" /> Simulados Ilimitados</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};