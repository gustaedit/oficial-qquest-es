
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { useStorage } from './store';
import { QuestionForm } from './components/Admin/QuestionForm';
import { TagManager } from './components/Admin/TagManager';
import { PackageManager } from './components/Admin/PackageManager';
import { PDFUploader } from './components/Admin/PDFUploader';
import { QuestionManager } from './components/Admin/QuestionManager';
import { Auth } from './components/Admin/Auth';
import { PaymentGate } from './components/Student/PaymentGate';
import { QuestionViewer } from './components/Student/QuestionViewer';
import { Dashboard as StudentDashboard } from './components/Student/Dashboard';
import { TargetSelector } from './components/Student/TargetSelector';
import { CustomTraining } from './components/Student/CustomTraining';
import { aiService } from './services/ai';
import { supabase } from './lib/supabase';
import { Shield, Loader2, Play, Cpu, History } from 'lucide-react';
import { Question } from './types';

const App: React.FC = () => {
  const { db, loading, connectionStatus, addQuestion, updateQuestion, deleteQuestion, updateTags, addPackage, addAttempt } = useStorage();
  
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Navegação
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('student');
  const [currentPage, setCurrentPage] = useState<string>('performance');
  
  // Estado de Edição
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Fluxo de Estudo
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>(null);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  
  // IA
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Verifica status de pagamento no Supabase
  const checkPaymentStatus = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setIsPaid(data.is_paid);
      }
    } catch (e) {
      console.error("Erro ao verificar pagamento", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) checkPaymentStatus(session.user);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) checkPaymentStatus(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetMission = (newPage: string) => {
    setCurrentPage(newPage);
    setSelectedFilters(null);
    setActivePackageId(null);
    setShowCustomConfig(false);
    setIsAIMode(false);
    setAiQuestions([]);
    setEditingQuestion(null);
  };

  const displayedQuestions = useMemo(() => {
    if (isAIMode) return aiQuestions;
    if (activePackageId) {
      const pkg = db.packages.find(p => p.id === activePackageId);
      return db.questions.filter(q => pkg?.questionIds.includes(q.id));
    }
    if (selectedFilters) {
      let filtered = db.questions;
      if (selectedFilters.discipline) filtered = filtered.filter(q => q.discipline === selectedFilters.discipline);
      if (selectedFilters.institution) filtered = filtered.filter(q => q.institution === selectedFilters.institution);
      if (selectedFilters.contestClass) filtered = filtered.filter(q => q.contestClass === selectedFilters.contestClass);
      if (selectedFilters.board) filtered = filtered.filter(q => q.board === selectedFilters.board);
      if (selectedFilters.difficulty) filtered = filtered.filter(q => q.difficulty === selectedFilters.difficulty);
      return filtered;
    }
    return db.questions;
  }, [db, activePackageId, selectedFilters, isAIMode, aiQuestions]);

  const handleToggleAI = async () => {
    if (!isAIMode) {
      setIsGenerating(true);
      try {
        const q = await aiService.generateQuestion('IBFC', 'Direito Penal', 'Médio', 'PC-BA');
        setAiQuestions([q]);
        setIsAIMode(true);
      } catch (e) {
        alert("Erro na sintetização IA");
      } finally {
        setIsGenerating(false);
      }
    } else {
      setIsAIMode(false);
    }
  };

  const handleSaveQuestion = async (q: Question) => {
    const success = editingQuestion ? await updateQuestion(q) : await addQuestion(q);
    if (success) {
      alert(editingQuestion ? 'Alvo atualizado!' : 'Alvo indexado!');
      setEditingQuestion(null);
      setCurrentPage('manage-questions');
    }
  };

  const renderAdmin = () => {
    switch (currentPage) {
      case 'add-question': 
        return <QuestionForm 
                  tags={db.tags} 
                  onSave={handleSaveQuestion} 
                  initialData={editingQuestion}
               />;
      case 'upload-pdf': return <PDFUploader tags={db.tags} onQuestionsExtracted={(qs) => qs.forEach(addQuestion)} />;
      case 'create-package': return <PackageManager tags={db.tags} questions={db.questions} onSave={addPackage} />;
      case 'manage-questions': 
        return <QuestionManager 
                  questions={db.questions} 
                  onDelete={deleteQuestion} 
                  onEdit={(q) => { setEditingQuestion(q); setCurrentPage('add-question'); }}
                />;
      case 'manage-tags': return <TagManager tags={db.tags} onUpdate={updateTags} />;
      default: return null;
    }
  };

  const renderStudent = () => {
    if (currentPage === 'performance') return <StudentDashboard attempts={db.attempts} />;

    if (currentPage === 'my-packages') {
      if (activePackageId) return <QuestionViewer questions={displayedQuestions} onAnswer={addAttempt} title="Simulado Estratégico" />;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
          {db.packages.map(p => (
            <div key={p.id} className="p-10 bg-white dark:bg-white/[0.03] border-2 border-gray-300 dark:border-white/10 rounded-[2.5rem] hover:border-primary transition-all group flex flex-col shadow-sm">
              <div className="mb-6 p-4 bg-primary/10 rounded-2xl w-fit"><Shield className="w-8 h-8 text-primary" /></div>
              <h3 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white">{p.name}</h3>
              <p className="text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest mt-4 leading-relaxed flex-1">{p.description}</p>
              <button onClick={() => setActivePackageId(p.id)} className="w-full flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-8 transition-all hover:bg-primary hover:text-black">
                Iniciar Missão <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (currentPage === 'free-study') {
      if (!selectedFilters && !activePackageId && !showCustomConfig) return <TargetSelector tags={db.tags} questions={db.questions} onSelect={(f:any) => f.isCustom ? setShowCustomConfig(true) : setSelectedFilters(f)} />;
      if (showCustomConfig && !selectedFilters) return <CustomTraining tags={db.tags} onStart={(f) => setSelectedFilters(f)} onCancel={() => setShowCustomConfig(false)} />;
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-gray-300 dark:border-white/10">
            <button onClick={() => { setSelectedFilters(null); setShowCustomConfig(false); }} className="px-6 py-2 bg-gray-200 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-600 dark:text-white/40 transition-all">← Alterar Alvos</button>
            <div className="flex gap-2">
              <button onClick={() => setIsAIMode(false)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!isAIMode ? 'bg-primary text-black' : 'text-gray-500'}`}><History className="w-4 h-4 inline mr-2" /> Real</button>
              <button onClick={handleToggleAI} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isAIMode ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}><Cpu className="w-4 h-4 inline mr-2" /> IA</button>
            </div>
          </div>
          <QuestionViewer questions={displayedQuestions} onAnswer={addAttempt} isGenerating={isGenerating} onRefreshAI={handleToggleAI} />
        </div>
      );
    }
    return null;
  };

  // 1. Loading Inicial
  if (authLoading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  
  // 2. Gatekeeper: Login
  if (!session) return <Auth onLoginSuccess={() => {}} />;

  // 3. Gatekeeper: Pagamento (Só barra alunos, admin sempre passa ou checamos flag)
  if (!isPaid) return <PaymentGate />;

  // 4. Loading de Dados
  if (loading) return <div className="h-screen bg-black flex flex-col items-center justify-center gap-6"><Loader2 className="w-12 h-12 text-primary animate-spin" /><p className="text-primary font-black uppercase tracking-widest">Sincronizando Base...</p></div>;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => { setActiveTab(tab); resetMission(tab === 'admin' ? 'manage-questions' : 'performance'); }}
      currentPage={currentPage}
      setCurrentPage={resetMission}
      connectionStatus={connectionStatus}
    >
      {activeTab === 'admin' ? renderAdmin() : renderStudent()}
    </Layout>
  );
};

export default App;
