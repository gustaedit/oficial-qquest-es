import React, { useState, useMemo } from 'react';
import { Shield, Target, ChevronRight, Zap, SlidersHorizontal, BookOpen, Crosshair, Hash, Play } from 'lucide-react';
import { Tags, Question } from '../../types';

interface TargetSelectorProps {
  tags: Tags;
  questions: Question[];
  onSelect: (filters: any) => void;
}

const DISCIPLINE_META: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'Língua Portuguesa':                        { color: 'text-pink-600 dark:text-pink-400',       bg: 'bg-pink-500/10',     border: 'border-pink-500/30',     emoji: '📝' },
  'Raciocínio Lógico':                        { color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-500/10',   border: 'border-indigo-500/30',   emoji: '🧩' },
  'Informática':                              { color: 'text-cyan-600 dark:text-cyan-400',       bg: 'bg-cyan-500/10',     border: 'border-cyan-500/30',     emoji: '💻' },
  'Atualidades':                              { color: 'text-orange-600 dark:text-orange-400',   bg: 'bg-orange-500/10',   border: 'border-orange-500/30',   emoji: '🌎' },
  'Direito Constitucional':                   { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-500/10',     border: 'border-blue-500/30',     emoji: '📜' },
  'Direito Administrativo':                   { color: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-500/10',   border: 'border-purple-500/30',   emoji: '🏛️' },
  'Direito Penal':                            { color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-500/10',      border: 'border-red-500/30',      emoji: '⚖️' },
  'Direito Processual Penal':                 { color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/10',     border: 'border-rose-500/30',     emoji: '🔍' },
  'Legislação Penal Especial':                { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',    border: 'border-amber-500/30',    emoji: '📋' },
  'Legislação Específica':                    { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',    border: 'border-amber-500/30',    emoji: '📋' },
  'Legislação Extravagante':                  { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',    border: 'border-amber-500/30',    emoji: '📋' },
  'Promoção da Igualdade Racial e de Gênero': { color: 'text-teal-600 dark:text-teal-400',       bg: 'bg-teal-500/10',     border: 'border-teal-500/30',     emoji: '🤝' },
  'Medicina Legal':                           { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30',  emoji: '🔬' },
  'Contabilidade Geral':                      { color: 'text-lime-600 dark:text-lime-400',       bg: 'bg-lime-500/10',     border: 'border-lime-500/30',     emoji: '📊' },
  'Matemática Financeira':                    { color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-500/10',    border: 'border-green-500/30',    emoji: '💰' },
  'Arquivologia':                             { color: 'text-yellow-600 dark:text-yellow-400',   bg: 'bg-yellow-500/10',   border: 'border-yellow-500/30',   emoji: '🗂️' },
  'Estatística':                              { color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-500/10',      border: 'border-sky-500/30',      emoji: '📈' },
};
const DEFAULT_META = { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', emoji: '📚' };

const CAREER_LABEL: Record<string, { label: string; desc: string }> = {
  'Investigador':   { label: 'Investigador de Polícia', desc: 'Contabilidade Geral + Mat. Financeira' },
  'Escrivão':       { label: 'Escrivão de Polícia',     desc: 'Arquivologia + Estatística' },
  'Delegado':       { label: 'Delegado de Polícia',     desc: 'Nível superior — matérias comuns' },
  'Perito':         { label: 'Perito Criminal',         desc: 'Medicina Legal + Conhecimentos Técnicos' },
  'Operacional':    { label: 'Investigador / Escrivão', desc: 'Carreiras operacionais PC-BA' },
  'Delta':          { label: 'Delegado',                desc: 'Carreira de Delegado PC-BA' },
  'Perícia':        { label: 'Perito Criminal',         desc: 'Carreira pericial PC-BA' },
  'Administrativo': { label: 'Administrativo',          desc: 'Cargos administrativos PC-BA' },
};

export const TargetSelector: React.FC<TargetSelectorProps> = ({ tags, questions, onSelect }) => {
  const [mode, setMode] = useState<'home' | 'career' | 'discipline'>('home');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  const disciplineCount = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach(q => { if (q.discipline) map[q.discipline] = (map[q.discipline] || 0) + 1; });
    return map;
  }, [questions]);

  const careerCount = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach(q => { if (q.contestClass) map[q.contestClass] = (map[q.contestClass] || 0) + 1; });
    return map;
  }, [questions]);

  const availableDisciplines = useMemo(() => {
    const fromTags = (tags.disciplines || []).filter(d => (disciplineCount[d] || 0) > 0);
    const fromBank = Object.keys(disciplineCount).filter(d => !(tags.disciplines || []).includes(d));
    return [...fromTags, ...fromBank];
  }, [tags.disciplines, disciplineCount]);

  const careerOptions = useMemo(() => {
    const classes = [...new Set(questions.map(q => q.contestClass).filter(Boolean))] as string[];
    return classes
      .map(id => ({ id, label: CAREER_LABEL[id]?.label ?? id, desc: CAREER_LABEL[id]?.desc ?? 'Questões PC-BA', count: careerCount[id] || 0 }))
      .filter(c => c.count > 0);
  }, [questions, careerCount]);

  const availableTopics = useMemo(() => {
    if (!selectedDiscipline) return [];
    const fromTags = (tags.topics?.[selectedDiscipline]) || [];
    const fromBank = [...new Set(questions.filter(q => q.discipline === selectedDiscipline && q.topic).map(q => q.topic as string))];
    return [...new Set([...fromTags, ...fromBank])];
  }, [selectedDiscipline, tags.topics, questions]);

  const maxCount = useMemo(() => Math.max(1, ...(Object.values(disciplineCount) as number[])), [disciplineCount]);
  const totalQs = questions.length;

  // ── HOME ──
  if (mode === 'home') {
    return (
      <div className="max-w-5xl mx-auto py-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full mb-5">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Polícia Civil da Bahia · 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-gray-900 dark:text-white leading-none mb-3">
            Como quer treinar?
          </h1>
          <p className="text-gray-500 dark:text-white/30 font-bold uppercase tracking-[0.3em] text-[11px]">
            {totalQs} questões disponíveis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <button
            onClick={() => setMode('discipline')}
            className="group p-7 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[2.5rem] hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4"
          >
            <div className="p-4 bg-primary/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-primary transition-colors">Por Disciplina</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-2 leading-relaxed">Penal, Processo Penal, Constitucional e mais</p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">{availableDisciplines.length} matérias com questões</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('career')}
            className="group p-7 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all text-left flex flex-col gap-4"
          >
            <div className="p-4 bg-blue-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Por Carreira</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-2 leading-relaxed">Investigador, Escrivão, Delegado ou Perito</p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">
                {careerOptions.length} cargo{careerOptions.length !== 1 ? 's' : ''} disponíve{careerOptions.length !== 1 ? 'is' : 'l'}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect({ isCustom: true })}
            className="group p-7 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[2.5rem] hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all text-left flex flex-col gap-4"
          >
            <div className="p-4 bg-cyan-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-7 h-7 text-cyan-500" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white group-hover:text-cyan-500 transition-colors">Filtro Avançado</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-2 leading-relaxed">Banca, ano, dificuldade e combinações</p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Multi-filtro</span>
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => onSelect({})}
          className="w-full group flex items-center justify-between px-7 py-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl hover:border-primary/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <Zap className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
              Treino Completo — todas as {totalQs} questões
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>
    );
  }

  // ── POR DISCIPLINA ──
  if (mode === 'discipline') {
    return (
      <div className="max-w-5xl mx-auto py-4 animate-in fade-in duration-400">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => { setMode('home'); setSelectedDiscipline(''); }}
            className="px-5 py-2.5 bg-gray-200 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-600 dark:text-white/40 hover:text-primary transition-all"
          >
            ← Voltar
          </button>
          {selectedDiscipline ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{(DISCIPLINE_META[selectedDiscipline] || DEFAULT_META).emoji}</span>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">{selectedDiscipline}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-0.5">
                  {disciplineCount[selectedDiscipline] || 0} questões · estude tudo ou filtre por tópico
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Escolha a Disciplina</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-1">{availableDisciplines.length} matérias · {totalQs} questões</p>
            </div>
          )}
        </div>

        {!selectedDiscipline ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDisciplines.map(disc => {
              const count = disciplineCount[disc] || 0;
              const meta  = DISCIPLINE_META[disc] || DEFAULT_META;
              const hasTopics = (tags.topics?.[disc]?.length || 0) > 0 || questions.some(q => q.discipline === disc && q.topic);
              return (
                <button
                  key={disc}
                  onClick={() => hasTopics ? setSelectedDiscipline(disc) : onSelect({ discipline: disc })}
                  className={`group p-6 bg-white dark:bg-white/[0.03] border-2 ${meta.border} rounded-3xl hover:shadow-xl transition-all text-left flex flex-col gap-3`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{meta.emoji}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      {count} questões
                    </span>
                  </div>
                  <h4 className="text-sm font-black uppercase italic tracking-tight text-gray-900 dark:text-white leading-snug">{disc}</h4>
                  <div className={`h-1 rounded-full ${meta.bg} overflow-hidden mt-auto`}>
                    <div
                      className={`h-full opacity-60 ${meta.bg.replace('/10', '')}`}
                      style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 space-y-4">
            <button
              onClick={() => onSelect({ discipline: selectedDiscipline })}
              className="w-full flex items-center justify-between px-7 py-5 bg-primary text-black rounded-3xl font-black uppercase text-[11px] tracking-widest hover:brightness-105 transition-all shadow-lg shadow-primary/20"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 fill-current" />
                Toda a disciplina · {disciplineCount[selectedDiscipline] || 0} questões
              </div>
              <Play className="w-5 h-5 fill-current" />
            </button>

            {availableTopics.length > 0 && (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 px-1 pt-2">Ou estude por tópico:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableTopics.map(topic => {
                    const topicCount = questions.filter(q => q.discipline === selectedDiscipline && q.topic === topic).length;
                    const meta = DISCIPLINE_META[selectedDiscipline] || DEFAULT_META;
                    return (
                      <button
                        key={topic}
                        onClick={() => onSelect({ discipline: selectedDiscipline, topic })}
                        className={`group flex items-center justify-between p-4 bg-white dark:bg-white/[0.03] border-2 ${meta.border} rounded-2xl hover:shadow-md transition-all text-left`}
                      >
                        <div className="flex items-center gap-3">
                          <Hash className={`w-4 h-4 shrink-0 ${meta.color}`} />
                          <span className="text-sm font-bold text-gray-800 dark:text-white/80 leading-snug">{topic}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {topicCount > 0 && (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{topicCount}</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              onClick={() => setSelectedDiscipline('')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-500 dark:text-white/20 hover:text-primary hover:border-primary/30 transition-all"
            >
              ← Outras Disciplinas
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── POR CARREIRA ──
  if (mode === 'career') {
    return (
      <div className="max-w-5xl mx-auto py-4 animate-in fade-in duration-400">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setMode('home')}
            className="px-5 py-2.5 bg-gray-200 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-600 dark:text-white/40 hover:text-primary transition-all"
          >
            ← Voltar
          </button>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Escolha sua Carreira</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-1">PC-BA · questões filtradas por cargo</p>
          </div>
        </div>

        {careerOptions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl">
            <Crosshair className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-4" />
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Nenhuma questão com cargo definido ainda</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {careerOptions.map(career => (
                <button
                  key={career.id}
                  onClick={() => onSelect({ contestClass: career.id })}
                  className="group p-7 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[2.5rem] hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Crosshair className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {career.count}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase italic tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{career.label}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/30 mt-1.5 leading-relaxed">{career.desc}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">Iniciar</span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => onSelect({})}
              className="w-full mt-5 group flex items-center justify-between px-7 py-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                  Todas as carreiras — {totalQs} questões
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
};