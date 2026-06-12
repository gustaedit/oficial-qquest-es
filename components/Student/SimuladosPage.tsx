import React from 'react';
import { FileText, Clock, Target, ChevronRight } from 'lucide-react';
import { useStorage } from '../../store'; // Conecta diretamente ao hook de armazenamento

interface SimuladosPageProps {
  onSelectSimulado: (id: string) => void;
}

export const SimuladosPage: React.FC<SimuladosPageProps> = ({ onSelectSimulado }) => {
  const { db } = useStorage();

  // Função para formatar os minutos (ex: 15 min -> 15min)
  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h 00min`;
  };

  // ── LOGICA DO TESTE: CONTA QUANTAS QUESTÕES DE INFORMÁTICA EXISTEM DE FATO NO BANCO ──
  const totalInformaticaNoBanco = React.useMemo(() => {
    return db.questions.filter(q => {
      if (!q.discipline) return false;
      const d = q.discipline.toLowerCase();
      return d.includes('informática') || d.includes('informatica');
    }).length;
  }, [db.questions]);

  // Se houver questões de informática, limitamos o teste visual a no máximo 5 delas
  const totalQuestoesTeste = totalInformaticaNoBanco > 5 ? 5 : totalInformaticaNoBanco;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header da Página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Ambiente de <span className="text-primary">Simulados</span>
        </h1>
        <p className="text-gray-500 dark:text-white/40 text-sm font-medium">
          Rode o teste controlado de informática para validar o cronômetro regressivo global e a renderização das alternativas.
        </p>
      </div>

      {/* Grid de Cards - Exibindo apenas o Simulado de Teste Focado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group relative bg-white dark:bg-black border border-gray-300 dark:border-white/10 rounded-[32px] p-6 hover:border-primary/50 transition-all shadow-sm overflow-hidden">
          {/* Efeito Visual Hover Background Glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />

          {/* Cabeçalho do Card */}
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-primary transition-transform group-hover:scale-110">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
              Ambiente de Teste
            </span>
          </div>

          {/* Informações Fixas do Teste Coletando dados Reais */}
          <div className="space-y-1 mb-6">
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              PC-BA • TESTE OPERACIONAL
            </span>
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
              Simulado Geral: Informática
            </h3>
            <p className="text-xs text-gray-400 dark:text-white/30 font-medium mt-1">
              Este caderno foi gerado para isolar e extrair exatamente 5 questões de Informática diretamente do seu arquivo CSV de dados reais do QConcursos.
            </p>
          </div>

          {/* Estatísticas Dinâmicas baseadas na presença de dados */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold">{totalQuestoesTeste} Questões</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold">{formatDuration(15)}</span>
            </div>
          </div>

          {/* Ação Principal: Envia o ID estático mapeado pelo interceptador do App.tsx */}
          <button 
            onClick={() => onSelectSimulado('simulado_teste_info')}
            disabled={totalQuestoesTeste === 0}
            className="w-full py-4 bg-primary text-black hover:brightness-110 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            {totalQuestoesTeste > 0 ? 'Iniciar Teste de Prova' : 'Nenhuma Questão Mapeada'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};