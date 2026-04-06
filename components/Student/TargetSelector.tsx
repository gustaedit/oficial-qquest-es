import React from 'react';
import { Shield, Target, ChevronRight, Zap, SlidersHorizontal, BookOpen, Play, Bookmark } from 'lucide-react';

export const TargetSelector: React.FC<any> = ({ tags, questions, onSelect, savedScenarios = [] }) => {
  return (
    <div className="max-w-5xl mx-auto py-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full mb-5">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Polícia Civil da Bahia</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase italic text-white mb-3">Como quer treinar?</h1>
      </div>

      {/* ── MISSÕES RECENTES ── */}
      {savedScenarios.length > 0 && (
        <div className="mb-10">
          <h4 className="text-[10px] font-black uppercase text-white/20 mb-5 px-2 flex items-center gap-3">
            <Bookmark className="w-3 h-3 text-primary" /> Missões Recentes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedScenarios.map((s: any) => (
              <button
                key={s.id}
                onClick={() => onSelect({ ...s.filters, answeredQuestionIds: s.answered_question_ids })}
                className="group p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-primary/40 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-black transition-all"><Play className="w-4 h-4 fill-current" /></div>
                  <span className="text-[8px] font-black uppercase text-white/20">{s.filters?.limit} Qs</span>
                </div>
                <h5 className="text-sm font-black uppercase italic text-white truncate">{s.title}</h5>
                <p className="text-[8px] font-bold uppercase text-white/20 mt-1 truncate">{s.filters?.disciplines?.join(' · ') || 'Geral'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OptionCard onClick={() => {}} icon={<BookOpen />} title="Por Disciplina" desc="Penal, Constitucional e mais" color="primary" />
        <OptionCard onClick={() => {}} icon={<Target />} title="Por Carreira" desc="Investigador, Escrivão ou Delegado" color="blue-500" />
        <OptionCard onClick={() => onSelect({ isCustom: true })} icon={<SlidersHorizontal />} title="Filtro Avançado" desc="Configurações táticas personalizadas" color="cyan-500" />
      </div>
    </div>
  );
};

const OptionCard = ({ icon, title, desc, color, onClick }: any) => (
  <button onClick={onClick} className="group p-7 bg-white/[0.03] border-2 border-white/10 rounded-[2.5rem] hover:border-primary transition-all text-left flex flex-col gap-4">
    <div className={`p-4 bg-${color}/10 rounded-2xl w-fit group-hover:scale-110 transition-transform text-${color}`}>{icon}</div>
    <div>
      <h3 className="text-xl font-black uppercase italic text-white">{title}</h3>
      <p className="text-[10px] font-bold uppercase text-white/30 mt-2">{desc}</p>
    </div>
  </button>
);