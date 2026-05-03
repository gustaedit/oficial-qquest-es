import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { useStorage } from './store';
import { Auth } from './components/Admin/Auth';
import { PaymentGate } from './components/Student/PaymentGate';
import { QuestionViewer } from './components/Student/QuestionViewer';
import { Dashboard as StudentDashboard } from './components/Student/Dashboard';
import { TargetSelector } from './components/Student/TargetSelector';
import { CustomTraining } from './components/Student/CustomTraining';
import { UserProfile } from './components/Student/UserProfile'; 
import { supabase } from './lib/supabase';
import { Shield, Loader2, Play, History } from 'lucide-react';

// ── FUNÇÃO DE EMBARALHAMENTO (Algoritmo Fisher-Yates) ──
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const { db, loading, connectionStatus, addAttempt } = useStorage();

  const [session, setSession] = useState<any>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('performance');
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>(null);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  const checkPaymentStatus = async (user: any) => {
    try {
      const { data } = await supabase.from('profiles').select('is_paid').eq('id', user.id).maybeSingle();
      setIsPaid(data ? data.is_paid : true);
    } catch { setIsPaid(true); }
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

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchScenarios = async () => {
      const { data } = await supabase
        .from('training_scenarios')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(3);
      if (data) setSavedScenarios(data);
    };
    fetchScenarios();
  }, [session, currentPage, showCustomConfig]);

  const resetMission = (newPage: string) => {
    setCurrentPage(newPage);
    setSelectedFilters(null);
    setActivePackageId(null);
    setShowCustomConfig(false);
  };

  // ── Lógica de Filtragem com Aleatoriedade ──
  const displayedQuestions = useMemo(() => {
    // 1. Simulados (Packages) - Agora embaralhados
    if (activePackageId) {
      const pkgQuestions = db.questions.filter(q => 
        db.packages.find(p => p.id === activePackageId)?.questionIds.includes(q.id)
      );
      return shuffleArray(pkgQuestions); // Aplica aleatoriedade ao simulado
    }

    if (selectedFilters !== null) {
      let filtered = db.questions;

      // Filtros Simples (Suporte singular)
      if (selectedFilters.discipline) filtered = filtered.filter(q => q.discipline === selectedFilters.discipline);
      if (selectedFilters.contestClass) filtered = filtered.filter(q => q.contestClass === selectedFilters.contestClass);

      // Filtros Avançados
      if (selectedFilters.disciplines?.length > 0) {
        filtered = filtered.filter(q => selectedFilters.disciplines.includes(q.discipline));
      }
      
      if (selectedFilters.answeredQuestionIds?.length > 0) {
        filtered = filtered.filter(q => !selectedFilters.answeredQuestionIds.includes(q.id));
      }

      if (selectedFilters.board) filtered = filtered.filter(q => q.board === selectedFilters.board);
      if (selectedFilters.year) filtered = filtered.filter(q => q.year === selectedFilters.year);

      // ── PASSO CRÍTICO: Embaralhar antes de cortar o limite ──
      const shuffled = shuffleArray(filtered);

      const limit = parseInt(selectedFilters.limit);
      return isNaN(limit) ? shuffled : shuffled.slice(0, limit);
    }
    
    // Fallback padrão: 20 questões aleatórias da base
    return shuffleArray(db.questions).slice(0, 20);
  }, [db.questions, selectedFilters, activePackageId, db.packages]);

  const renderStudent = () => {
    if (currentPage === 'performance') return <StudentDashboard attempts={db.attempts} />;
    if (currentPage === 'profile') return <UserProfile />;

    if (currentPage === 'free-study') {
      if (!selectedFilters && !showCustomConfig) {
        return (
          <TargetSelector
            tags={db.tags}
            questions={db.questions}
            savedScenarios={savedScenarios}
            onSelect={(f: any) => f.isCustom ? setShowCustomConfig(true) : setSelectedFilters(f)}
          />
        );
      }
      if (showCustomConfig && !selectedFilters) {
        return (
          <CustomTraining
            tags={db.tags}
            userId={session?.user?.id}
            answeredQuestionIds={db.attempts.map(a => a.questionId)}
            onStart={(f) => setSelectedFilters(f)}
            onCancel={() => setShowCustomConfig(false)}
          />
        );
      }
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white/50 dark:bg-white/[0.02] p-4 rounded-3xl border border-gray-300 dark:border-white/10">
            <button onClick={() => { setSelectedFilters(null); setShowCustomConfig(false); }} className="px-6 py-2 bg-gray-200 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase transition-all">← Mudar Missão</button>
            <div className="px-6 py-2 text-primary text-[10px] font-black uppercase flex items-center gap-2"><History className="w-4 h-4" /> Operação Ativa</div>
          </div>
          <QuestionViewer questions={displayedQuestions} onAnswer={addAttempt} />
        </div>
      );
    }

    if (currentPage === 'my-packages') {
      if (activePackageId) {
        return (
          <div className="space-y-6">
            <button onClick={() => setActivePackageId(null)} className="px-6 py-2 bg-gray-200 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">← Voltar</button>
            <QuestionViewer questions={displayedQuestions} onAnswer={addAttempt} title="Simulado Estratégico" />
          </div>
        );
      }
    }
    return null;
  };

  if (authLoading || loading) return <div className="h-screen bg-black flex flex-col items-center justify-center gap-6"><Loader2 className="w-12 h-12 text-primary animate-spin" /><p className="text-primary font-black uppercase tracking-widest">Sincronizando Base...</p></div>;
  if (!session) return <Auth onLoginSuccess={() => {}} />;
  if (!isPaid) return <PaymentGate />;

  return <Layout currentPage={currentPage} setCurrentPage={resetMission} connectionStatus={connectionStatus}>{renderStudent()}</Layout>;
};

export default App;