import React, { useState } from 'react';
import { 
  Shield, Lock, ChevronRight, Mail, Loader2, 
  RefreshCw, AlertCircle, UserPlus, ShieldAlert,
  Eye, EyeOff // Novos ícones importados
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ── ESTADO DE VISIBILIDADE DA SENHA ──
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("DIVERGÊNCIA DE DADOS: As chaves de acesso não conferem.");
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("SEGURANÇA FRACA: A chave deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        onLoginSuccess();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert("SOLICITAÇÃO ENVIADA: Verifique seu e-mail para validar as credenciais.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "FALHA NA OPERAÇÃO: Comando central não responde.");
    } finally {
      setLoading(false);
    }
  };

  const themeColor = isLogin ? 'bg-primary' : 'bg-cyan-500';
  const themeText = isLogin ? 'text-primary' : 'text-cyan-400';

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="text-center mb-10">
          <div className={`inline-block p-5 text-black rounded-[2rem] shadow-2xl transition-all duration-500 ${themeColor} mb-8`}>
            {isLogin ? <Shield className="w-12 h-12 stroke-[2.5px]" /> : <UserPlus className="w-12 h-12 stroke-[2.5px]" />}
          </div>
          <h1 className="text-4xl font-black uppercase italic text-white leading-none">
            {isLogin ? 'Acesso Tático' : 'Recrutamento'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card !bg-white/[0.03] p-8 md:p-10 space-y-5 border-white/10 relative overflow-hidden">
          
          <div className="space-y-4">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Identificação</label>
              <input 
                type="email"
                placeholder="OPERADOR@MISSÃO.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 p-5 pl-6 text-xs font-black uppercase text-white outline-none focus:border-white/40 rounded-2xl transition-all"
              />
            </div>

            {/* Campo Senha com Visibilidade Alternável */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Chave de Acesso</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 p-5 pl-6 pr-14 text-xs font-black uppercase text-white outline-none focus:border-white/40 rounded-2xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Campo de Confirmação (Aparece apenas no Cadastro) */}
            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400/50 ml-4 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" /> Confirmar Chave
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="DIGITE NOVAMENTE"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-cyan-500/20 p-5 pl-6 pr-14 text-xs font-black uppercase text-white outline-none focus:border-cyan-500/50 rounded-2xl transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-500 text-[10px] font-black uppercase leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-6 text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${themeColor} hover:brightness-110 active:scale-95 disabled:opacity-50`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Login' : 'Sintetizar'} 
              <ChevronRight className="w-5 h-5" />
            </button>

            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setConfirmPassword('');
                setShowPassword(false); // Reseta a visibilidade ao trocar de modo
              }}
              className="w-full p-4 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all flex flex-col items-center gap-2"
            >
              <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${themeText}`}>
                <RefreshCw className="w-3 h-3" /> 
                {isLogin ? 'SOLICITAR INGRESSO' : 'VOLTAR AO TERMINAL'}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};