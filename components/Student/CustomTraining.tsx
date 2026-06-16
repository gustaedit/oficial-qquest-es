import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Tags, Difficulty, Question } from '../../types';
import {
  SlidersHorizontal, Target, Calendar, Briefcase,
  BookOpen, Layers, BarChart, Zap, X, Search, Check, Trash2,
  Save, Play, EyeOff, Bookmark, Loader2, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Scenario {
  id: string;
  user_id: string;
  title: string;           
  filters: FilterState;     
  last_question_index: number;
  answered_question_ids: string[];
  created_at: string;
  updated_at: string;
}

interface FilterState {
  board: string;
  disciplines: string[];
  topics: string[];
  year: string;
  difficulty: Difficulty | '';
  institution: string;
  limit: string;
  hideAnswered: boolean;
}

interface CustomTrainingProps {
  tags: Tags;
  onStart: (filters: any) => void;
  onCancel: () => void;
  answeredQuestionIds?: string[];
  userId?: string;
}

const DEFAULT_FILTERS: FilterState = {
  board: '',
  disciplines: [],
  topics: [],
  year: '',
  difficulty: '',
  institution: '',
  limit: '20',
  hideAnswered: false,
};

export const CustomTraining: React.FC<CustomTrainingProps> = ({
  tags,
  onStart,
  onCancel,
  answeredQuestionIds = [],
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'saved'>('config');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mapeia sintonizadamente o lote global de questões para evitar erro ts(2322) de tipo 'unknown'
  const activeQuestions = useMemo<Question[]>(() => {
    return ((tags as any).questions || []) as Question[];
  }, [tags]);

  // ── MAPAS OPERACIONAIS DINÂMICOS COLETADOS DO BANCO REAL ──
  const dynamicBoards = useMemo<string[]>(() => {
    const list = activeQuestions.map(q => q.board?.trim()).filter(Boolean);
    return list.length > 0 ? [...new Set(list)] as string[] : ['FCC', 'CESPE', 'FGV', 'IBFC', 'VUNESP'];
  }, [activeQuestions]);

  const dynamicYears = useMemo<string[]>(() => {
    const list = activeQuestions.map(q => String(q.year || '').trim()).filter(Boolean);
    return list.length > 0 ? [...new Set(list)].sort((a, b) => b.localeCompare(a)) as string[] : ['2026', '2025', '2024', '2023', '2022'];
  }, [activeQuestions]);

  const dynamicInstitutions = useMemo<string[]>(() => {
    const list = activeQuestions.map(q => q.institution?.trim()).filter(Boolean);
    return list.length > 0 ? [...new Set(list)] as string[] : ['PC-BA', 'PM-BA', 'TJ-BA', 'PF', 'PRF'];
  }, [activeQuestions]);

  const dynamicDisciplines = useMemo<string[]>(() => {
    const list = activeQuestions.map(q => q.discipline?.trim()).filter(Boolean);
    return list.length > 0 ? [...new Set(list)] as string[] : tags.disciplines || [];
  }, [activeQuestions, tags.disciplines]);

  const availableTopics = useMemo<string[]>(() => {
    if (filters.disciplines.length === 0) return [];
    
    const lowerSelected = filters.disciplines.map(d => d.toLowerCase());
    const matchedTopics = activeQuestions
      .filter(q => q.discipline && lowerSelected.includes(q.discipline.trim().toLowerCase()) && q.topic)
      .map(q => q.topic!.trim())
      .filter(Boolean);

    if (matchedTopics.length > 0) {
      return [...new Set(matchedTopics)] as string[];
    }

    const topics: string[] = [];
    filters.disciplines.forEach(d => {
      if (tags.topics[d]) topics.push(...tags.topics[d]);
    });
    return [...new Set(topics)];
  }, [filters.disciplines, activeQuestions, tags.topics]);

  const loadScenarios = useCallback(async () => {
    if (!userId) return;
    setLoadingScenarios(true);
    try {
      const { data, error } = await supabase
        .from('training_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedScenarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar cenários:', error);
    } finally {
      setLoadingScenarios(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadScenarios();
    }
  }, [activeTab, loadScenarios]);

  const handleStart = () => {
    onStart({
      ...filters,
      answeredQuestionIds: filters.hideAnswered ? answeredQuestionIds : [],
    });
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !scenarioTitle.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from('training_scenarios').insert([
        {
          user_id: userId,
          title: scenarioTitle.trim(),
          filters,
          answered_question_ids: answeredQuestionIds,
          last_question_index: 0,
        },
      ]);

      if (error) throw error;

      setScenarioTitle('');
      setIsSaving(false);
      await loadScenarios();
    } catch (error) {
      console.error('Erro ao salvar cenário:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja destruir este registro de missão permanentemente?')) return;

    try {
      const { error } = await supabase.from('training_scenarios').delete().eq('id', id);
      if (error) throw error;
      setSavedScenarios(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const toggleItem = (currentList: string[], field: keyof FilterState, item: string) => {
    const updated = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    
    setFilters(prev => ({ ...prev, [field]: updated }));
  };

  return (
    <div className="max-w-4xl mx-auto py-2 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="px-5 py-2.5 bg-gray-200 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-600 dark:text-white/40 hover:text-primary transition-all">← Cancelar</button>
          <h2 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white flex items-center gap-2"><SlidersHorizontal className="w-6 h-6 text-primary" /> Filtro Avançado</h2>
        </div>
        <div className="flex bg-gray-200 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-300 dark:border-white/10">
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'config' ? 'bg-primary text-black shadow' : 'text-gray-500 dark:text-white/40'}`}>Configurar</button>
          <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'saved' ? 'bg-primary text-black shadow' : 'text-gray-500 dark:text-white/40'}`}><Bookmark className="w-3 h-3" /> Meus Treinos ({userId ? savedScenarios.length : 0})</button>
        </div>
      </div>

      {activeTab === 'config' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <MultiSelectSection 
              icon={<BookOpen />} 
              label="Disciplinas" 
              options={dynamicDisciplines} 
              selected={filters.disciplines} 
              onToggle={item => toggleItem(filters.disciplines, 'disciplines', item)} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SelectSection icon={<Target />} label="Banca" value={filters.board} options={dynamicBoards} onChange={val => setFilters(prev => ({ ...prev, board: val }))} />
              <SelectSection icon={<Calendar />} label="Ano" value={filters.year} options={dynamicYears} onChange={val => setFilters(prev => ({ ...prev, year: val }))} />
              <SelectSection icon={<Briefcase />} label="Órgão / Instituição" value={filters.institution} options={dynamicInstitutions} onChange={val => setFilters(prev => ({ ...prev, institution: val }))} />
              <SelectSection icon={<Layers />} label="Nível / Dificuldade" value={filters.difficulty} options={['Fácil', 'Médio', 'Difícil']} onChange={val => setFilters(prev => ({ ...prev, difficulty: val as Difficulty }))} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/50 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 p-6 rounded-[2.5rem] space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2 mb-3"><BarChart className="w-3.5 h-3.5 text-primary" /> Volume do Lote</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['5', '10', '20', '50'].map(num => (
                      <button key={num} onClick={() => setFilters(prev => ({ ...prev, limit: num }))} className={`py-3 font-mono font-black rounded-xl text-xs transition-all border ${filters.limit === num ? 'bg-primary border-primary text-black' : 'bg-transparent border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/40'}`}>{num}</button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={() => setFilters(prev => ({ ...prev, hideAnswered: !prev.hideAnswered }))} className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left ${filters.hideAnswered ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-transparent border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/20'}`}>
                    <div className="flex items-center gap-3"><EyeOff className="w-5 h-5" /><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-wider">Histórico Inédito</span><span className="text-[8px] font-bold uppercase opacity-60">Ocultar Qs respondidas</span></div></div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${filters.hideAnswered ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-gray-400'}`}>{filters.hideAnswered && <Check className="w-3 h-3 stroke-[4]" />}</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-300 dark:border-white/10">
                {!isSaving ? (
                  <button onClick={() => setIsSaving(true)} disabled={!userId} className="w-full py-4 bg-white/5 border border-gray-300 dark:border-white/10 hover:border-cyan-500/50 text-gray-700 dark:text-white/60 hover:text-cyan-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-20"><Save className="w-4 h-4" /> Salvar Escopo</button>
                ) : (
                  <form onSubmit={handleSaveScenario} className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <input type="text" required placeholder="NOME DO TREINO (EX: PENAL TÁTICO)" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:border-cyan-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="submit" disabled={actionLoading} className="py-2.5 bg-cyan-500 text-black font-black text-[9px] uppercase tracking-wider rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-1">{actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}</button>
                      <button type="button" onClick={() => { setIsSaving(false); setScenarioTitle(''); }} className="py-2.5 bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-white/40 font-black text-[9px] uppercase tracking-wider rounded-xl">Mudar</button>
                    </div>
                  </form>
                )}
                <button onClick={handleStart} className="w-full py-5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:brightness-105 flex items-center justify-center gap-2 shadow-lg shadow-primary/10"><Zap className="w-4 h-4 fill-current" /> Iniciar Missão</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {loadingScenarios ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3"><Loader2 className="w-8 h-8 text-primary animate-spin" /><span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Acessando Arquivos...</span></div>
          ) : savedScenarios.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-gray-300 dark:border-white/5 rounded-[2rem]"><span className="text-[10px] font-black uppercase text-gray-400 dark:text-white/20 tracking-widest">Nenhuma missão tática registrada neste terminal</span></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedScenarios.map(s => (
                <div key={s.id} onClick={() => onStart({ ...s.filters, answeredQuestionIds: s.answered_question_ids })} className="group p-6 bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/5 rounded-[2rem] hover:border-primary/40 transition-all text-left cursor-pointer flex justify-between items-center">
                  <div className="space-y-2 max-w-[80%]">
                    <div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-black transition-all"><Play className="w-3 h-3 fill-current" /></div><span className="text-[9px] font-black text-primary uppercase tracking-widest">{s.filters.limit || '20'} Qs Operacionais</span></div>
                    <h4 className="text-base font-black uppercase italic text-gray-900 dark:text-white truncate">{s.title}</h4>
                    <p className="text-[8px] font-bold text-gray-400 dark:text-white/20 uppercase truncate">{s.filters.disciplines?.join(' · ') || 'Filtros Amplos'}</p>
                  </div>
                  <button onClick={(e) => handleDeleteScenario(s.id, e)} className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MultiSelectSectionProps { icon: React.ReactElement; label: string; options: string[]; selected: string[]; onToggle: (item: string) => void; disabled?: boolean; }
const MultiSelectSection: React.FC<MultiSelectSectionProps> = ({ icon, label, options, selected, onToggle, disabled }) => {
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
      <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2">
        {React.cloneElement(icon, { className: 'w-3.5 h-3.5' } as React.ComponentProps<any>)} {label}
      </label>
      <div className="bg-white/[0.02] border border-gray-300 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-inner bg-white dark:bg-black/20">
        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-3 bg-gray-100 dark:bg-white/5">
          <Search className="w-4 h-4 text-gray-400 dark:text-white/20" />
          <input type="text" placeholder="BUSCAR MATÉRIA..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-[10px] font-bold text-gray-800 dark:text-white w-full uppercase placeholder:text-gray-400 dark:placeholder:text-white/10" />
        </div>
        <div className="h-48 overflow-y-auto p-2 scrollbar-thin">
          {filtered.map(opt => (
            <button key={opt} onClick={() => onToggle(opt)} className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 text-left transition-all ${selected.includes(opt) ? 'bg-primary text-black font-black' : 'text-gray-700 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider">{opt}</span>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(opt) ? 'border-black' : 'border-gray-400'}`}>{selected.includes(opt) && <Check className="w-2.5 h-2.5 stroke-[4]" />}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SelectSectionProps { icon: React.ReactElement; label: string; value: string; options: string[]; onChange: (val: string) => void; }
const SelectSection: React.FC<SelectSectionProps> = ({ icon, label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-3 relative">
      <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2">
        {React.cloneElement(icon, { className: 'w-3.5 h-3.5' } as React.ComponentProps<any>)} {label}
      </label>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-white/60 hover:border-primary/50 transition-all"><span>{value || 'Todas'}</span><ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-black/90 border border-gray-300 dark:border-white/10 rounded-2xl max-h-40 overflow-y-auto p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={() => { onChange(''); setIsOpen(false); }} className={`w-full text-left p-3 rounded-xl text-[9px] font-black uppercase tracking-wider ${value === '' ? 'bg-primary text-black' : 'text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5'}`}>Todas</button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left p-3 rounded-xl text-[9px] font-black uppercase tracking-wider ${value === opt ? 'bg-primary text-black' : 'text-gray-700 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5'}`}>{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};