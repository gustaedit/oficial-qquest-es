import React, { useState } from 'react';
import { 
  Shield, ChevronRight, Loader2, 
  ExternalLink, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fluxo de Autenticação Direto e Exclusivo de Login
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "FALHA NA AUTENTICAÇÃO: Credenciais inválidas ou comando central não responde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block p-5 text-black rounded-[2rem] shadow-2xl bg-primary mb-8">
            <Shield className="w-12 h-12 stroke-[2.5px]" />
          </div>
          <h1 className="text-4xl font-black uppercase italic text-white leading-none">
            Acesso Tático
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold tracking-[4px] uppercase mt-2">
            Área Restrita para Alunos Cadastrados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card !bg-white/[0.03] p-8 md:p-10 space-y-5 border-white/10 relative overflow-hidden">
          
          <div className="space-y-4">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Identificação (E-mail)</label>
              <input 
                type="email"
                placeholder="OPERADOR@MISSÃO.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 p-5 pl-6 text-xs font-black uppercase text-white outline-none focus:border-white/40 rounded-2xl transition-all"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Chave de Acesso (Senha)</label>
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
                  onClick={() => { setShowPassword(!showPassword); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-500 text-[10px] font-black uppercase leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Botão de Entrar */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl bg-primary hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Autenticar'} 
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Botão de Solicitar Acesso (Direciona para a compra externa) */}
            <a 
              href="https://kim-questoes-lancamento.netlify.app/" // ← INSIRA SEU LINK DE VENDAS AQUI
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full p-4 border border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-primary/20 transition-all flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <ExternalLink className="w-3 h-3" /> 
                Não tem uma conta? Adquirir Acesso
              </div>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};