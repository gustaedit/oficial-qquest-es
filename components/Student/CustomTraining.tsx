import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Tags, Difficulty } from '../../types';
import {
  SlidersHorizontal, ChevronRight, Target, Calendar, Briefcase,
  BookOpen, Layers, BarChart, Zap, X, Search, Check, Trash2,
  Save, Play, Clock, EyeOff, Bookmark, Loader2, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── TIPOS (Sincronizados com a imagem b69873.png do seu Supabase) ───────────

interface Scenario {
  id: string;
  user_id: string;
  title: string;           // Corrigido: No seu banco a coluna é 'title'
  filters: FilterState;     // Coluna 'filters' (jsonb) do banco
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
  hideAnswered: true,
};

export const CustomTraining: React.FC<CustomTrainingProps> = ({
  tags,
  onStart,
  onCancel,
  answeredQuestionIds = [],
  userId,
}) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [savingScenario, setSavingScenario] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'filter' | 'scenarios'>('filter');

  const availableTopics = useMemo(() => {
    const topics: string[] = [];
    filters.disciplines.forEach(d => {
      if (tags.topics[d]) topics.push(...tags.topics[d]);
    });
    return [...new Set(topics)];
  }, [filters.disciplines, tags.topics]);

  const loadScenarios = useCallback(async () => {
    if (!userId) return;
    setLoadingScenarios(true);
    try {
      const { data, error } = await supabase
        .from('training_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (!error && data) setScenarios(data);
    } catch (e) {
      console.warn('Erro ao carregar cenários:', e);
    }
    setLoadingScenarios(false);
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'scenarios') loadScenarios();
  }, [activeTab, loadScenarios]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleItem = (list: string[], key: 'disciplines' | 'topics', item: string) => {
    if (list.includes(item)) {
      setFilter(key, list.filter(i => i !== item));
    } else {
      setFilter(key, [...list, item]);
    }
  };

  // ── FUNÇÃO DE SALVAMENTO CORRIGIDA (COLUNA 'TITLE') ──
  const handleSaveScenario = async () => {
    if (!newScenarioName.trim() || !userId) return;
    setSavingScenario(true);
    
    try {
      const payload = {
        user_id: userId,
        title: newScenarioName.trim(), // Ajustado para 'title' conforme o banco
        filters: filters,            // Salva o objeto completo no banco
        last_question_index: 0,
        answered_question_ids: filters.hideAnswered ? answeredQuestionIds : [],
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('training_scenarios')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase:', error.message);
        alert(`Erro ao salvar: ${error.message}`);
        return;
      }

      if (data) {
        setScenarios(prev => [data, ...prev]);
        setNewScenarioName('');
        setShowSaveForm(false);
        setActiveTab('scenarios');
      }
    } catch (e) {
      console.error('Erro inesperado:', e);
    } finally {
      setSavingScenario(false);
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await supabase.from('training_scenarios').delete().eq('id', scenarioId);
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    } catch (e) {
      console.warn('Erro ao deletar:', e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
        
        <div className="bg-[#0F172A] p-8 md:p-10 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary text-black rounded-3xl">
                <SlidersHorizontal className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic text-white">Construtor de Missão</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Sincronização Operacional · PC-BA</p>
              </div>
            </div>
            <button onClick={onCancel} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="flex gap-2 mt-8">
            <TabButton active={activeTab === 'filter'} onClick={() => setActiveTab('filter')} label="Filtros" icon={<SlidersHorizontal className="w-4 h-4"/>} />
            <TabButton active={activeTab === 'scenarios'} onClick={() => setActiveTab('scenarios')} label={`Meus Treinos (${scenarios.length})`} icon={<Bookmark className="w-4 h-4"/>} />
          </div>
        </div>

        {activeTab === 'filter' ? (
          <div className="p-8 md:p-12 space-y-10">
            <div onClick={() => setFilter('hideAnswered', !filters.hideAnswered)} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${filters.hideAnswered ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-white/10'}`}>
              <div className="flex items-center gap-4">
                <EyeOff className={`w-5 h-5 ${filters.hideAnswered ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-black uppercase text-gray-900 dark:text-white">Focar em questões inéditas</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{answeredQuestionIds.length} questões no registro de histórico</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${filters.hideAnswered ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.hideAnswered ? 'left-7' : 'left-1'}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <VisualSelect icon={<Target />} label="Banca" value={filters.board} onChange={v => setFilter('board', v)} options={tags.boards} />
              <VisualSelect icon={<Calendar />} label="Ano" value={filters.year} onChange={v => setFilter('year', v)} options={tags.years} />
              <VisualSelect icon={<Briefcase />} label="Órgão" value={filters.institution} onChange={v => setFilter('institution', v)} options={tags.institutions} />
              <VisualSelect icon={<BarChart />} label="Dificuldade" value={filters.difficulty} onChange={v => setFilter('difficulty', v as Difficulty | '')} options={['Fácil', 'Médio', 'Difícil']} />
              <div className="group space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 dark:text-white/30 ml-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Quantidade</label>
                <input type="number" value={filters.limit} onChange={e => setFilter('limit', e.target.value)} className="w-full bg-gray-100 dark:bg-white/[0.04] border-2 border-gray-200 dark:border-white/10 p-5 outline-none text-[11px] font-black text-gray-900 dark:text-white rounded-[1.5rem] focus:border-primary transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-8 border-t border-gray-200 dark:border-white/5">
              <MultiSelectSection icon={<BookOpen />} label="Disciplinas" options={tags.disciplines} selected={filters.disciplines} onToggle={item => toggleItem(filters.disciplines, 'disciplines', item)} />
              <MultiSelectSection icon={<Layers />} label="Assuntos" options={availableTopics} selected={filters.topics} onToggle={item => toggleItem(filters.topics, 'topics', item)} disabled={filters.disciplines.length === 0} />
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /> Resetar</button>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setShowSaveForm(true)} className="px-6 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white/60 hover:text-primary transition-all"><Save className="w-4 h-4 inline mr-2" /> Salvar Missão</button>
                <button onClick={() => onStart(filters)} className="flex-1 md:flex-none px-12 py-4 bg-primary text-black font-black uppercase text-[11px] rounded-2xl hover:scale-[1.03] transition-all shadow-xl shadow-primary/20">Iniciar Missão</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12">
            {loadingScenarios ? (
              <div className="flex flex-col items-center py-20 gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="text-[10px] font-black uppercase text-white/20">Sincronizando Banco...</span></div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl"><Bookmark className="w-12 h-12 text-white/5 mx-auto mb-4" /><p className="text-[10px] font-black uppercase text-white/20">Nenhum cenário salvo.</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scenarios.map(s => (
                  <ScenarioCard key={s.id} scenario={s} onDelete={() => handleDeleteScenario(s.id)} onStart={() => onStart({ ...s.filters, answeredQuestionIds: s.answered_question_ids })} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSaveForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h4 className="text-xl font-black uppercase italic text-white mb-6">Nomear Missão</h4>
            <input autoFocus type="text" placeholder="Ex: PC-BA | Direito Penal" value={newScenarioName} onChange={e => setNewScenarioName(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary transition-all mb-6 uppercase" />
            <div className="flex gap-3">
              <button onClick={() => setShowSaveForm(false)} className="flex-1 py-4 bg-white/5 text-white/40 font-black uppercase text-[10px] rounded-2xl hover:bg-white/10 transition-all">Cancelar</button>
              <button onClick={handleSaveScenario} disabled={!newScenarioName.trim() || savingScenario} className="flex-1 py-4 bg-primary text-black font-black uppercase text-[10px] rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">{savingScenario ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Registro'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ScenarioCard = ({ scenario, onDelete, onStart }: any) => (
  <div className="group bg-[#0A0A0A] border border-white/5 p-6 rounded-[2rem] hover:border-primary/40 transition-all flex items-center justify-between shadow-sm">
    <div className="flex-1">
      {/* Corrigido para scenario.title */}
      <h5 className="text-lg font-black uppercase italic text-white group-hover:text-primary transition-colors">{scenario.title}</h5>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
          {scenario.filters?.limit || '20'} QUESTÕES
        </span>
        <span className="text-[8px] font-black uppercase text-white/20 tracking-widest mt-1">
          {scenario.filters?.disciplines?.length > 0 ? scenario.filters.disciplines.join(' · ') : 'Filtros Gerais'}
        </span>
      </div>
    </div>
    <div className="flex gap-3 ml-4">
      <button onClick={onDelete} className="p-3 text-white/10 hover:text-red-500 transition-colors bg-white/5 rounded-xl"><Trash2 className="w-4 h-4"/></button>
      <button onClick={onStart} className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl hover:bg-primary transition-all active:scale-95 shadow-lg">Engajar</button>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${active ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'bg-white/5 text-white/40 hover:text-white'}`}>
    {icon} {label}
  </button>
);

const VisualSelect = ({ icon, label, value, onChange, options, placeholder = 'Todas' }: any) => (
  <div className="group space-y-3">
    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-white/30 ml-4 flex items-center gap-2">
      {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })} {label}
    </label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-100 dark:bg-white/[0.04] border-2 border-gray-200 dark:border-white/10 p-5 outline-none text-[11px] font-black text-gray-900 dark:text-white rounded-[1.5rem] focus:border-primary appearance-none cursor-pointer transition-all">
        <option value="">{placeholder}</option>
        {options.map((o: any) => <option key={o} value={o} className="bg-white dark:bg-black">{o}</option>)}
      </select>
      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const MultiSelectSection = ({ icon, label, options, selected, onToggle, disabled = false }: any) => {
  const [search, setSearch] = useState('');
  const filtered = options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
      <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 ml-2">{React.cloneElement(icon, { className: 'w-3.5 h-3.5' })} {label}</label>
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden shadow-inner">
        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
          <Search className="w-4 h-4 text-white/20" />
          <input type="text" placeholder="BUSCAR MATÉRIA..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-[10px] font-bold text-white w-full uppercase placeholder:text-white/10" />
        </div>
        <div className="h-48 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/20">
          {filtered.map((opt: string) => (
            <button key={opt} onClick={() => onToggle(opt)} className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 text-left transition-all ${selected.includes(opt) ? 'bg-primary text-black' : 'text-white/40 hover:bg-white/5'}`}>
              <span className="text-[9px] font-black uppercase leading-none">{opt}</span>
              {selected.includes(opt) && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};