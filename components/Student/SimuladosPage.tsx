import React from 'react';
import { Calendar, ChevronRight, FileText, Clock, Target } from 'lucide-react';

// Tipagem para as propriedades do componente
interface SimuladosPageProps {
  onSelectSimulado: (id: string) => void;
}

const SIMULADOS_DATA = [
  {
    id: "1", // IDs como string para bater com seu activePackageId
    title: "Simulado PM-BA 2022",
    year: "2022",
    institution: "PM-BA",
    questions: 80,
    duration: "4h 30min",
    status: "Disponível"
  },
  {
    id: "2",
    title: "Simulado PC-BA 2021",
    year: "2021",
    institution: "PC-BA",
    questions: 100,
    duration: "5h 00min",
    status: "Disponível"
  },
  {
    id: "3",
    title: "Simulado ESA 2023",
    year: "2023",
    institution: "Exército",
    questions: 50,
    duration: "4h 00min",
    status: "Concluído"
  }
];

export const SimuladosPage: React.FC<SimuladosPageProps> = ({ onSelectSimulado }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header da Página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Acervo de <span className="text-primary">Missões</span>
        </h1>
        <p className="text-gray-500 dark:text-white/40 text-sm font-medium">
          Selecione uma prova anterior para treinar em condições reais de combate.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SIMULADOS_DATA.map((simulado) => (
          <div 
            key={simulado.id}
            className="group relative bg-white dark:bg-black border border-gray-300 dark:border-white/10 rounded-[32px] p-6 hover:border-primary/50 transition-all shadow-sm overflow-hidden"
          >
            {/* Background Glow Efeito Hover */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />

            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl text-primary transition-transform group-hover:scale-110">
                <FileText className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                simulado.status === 'Concluído' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-primary/10 text-primary'
              }`}>
                {simulado.status}
              </span>
            </div>

            {/* Info do Simulado */}
            <div className="space-y-1 mb-6">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                {simulado.institution} • {simulado.year}
              </span>
              <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                {simulado.title}
              </h3>
            </div>

            {/* Stats Rápidas */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold">{simulado.questions} Questões</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold">{simulado.duration}</span>
              </div>
            </div>

            {/* Ação Principal */}
            <button 
              onClick={() => onSelectSimulado(simulado.id)}
              className="w-full py-4 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Iniciar Simulado <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};