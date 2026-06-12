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
import { SimuladosPage } from './components/Student/SimuladosPage';
import { supabase } from './lib/supabase';
import { UserAttempt, Question } from './types'; 
import { Shield, Loader2, History, Clock, Target, Award, BarChart3, ChevronLeft } from 'lucide-react';

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

  const [currentPage, setCurrentPage] = useState<string>('free-study');
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>(null);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  
  const [currentSimuladoAnswers, setCurrentSimuladoAnswers] = useState<UserAttempt[]>([]);
  const [simuladoResult, setSimuladoResult] = useState<any | null>(null);
  const [simuladoStartTime, setSimuladoStartTime] = useState<number>(0);

  const userAttempts = useMemo(() => {
    const currentUserId = session?.user?.id;
    if (!currentUserId) return [];
    return db.attempts.filter((a: UserAttempt) => 
      a.userId === currentUserId || (a as any).user_id === currentUserId
    );
  }, [db.attempts, session?.user?.id]);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session?.user) checkPaymentStatus(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activePackageId) {
      setSimuladoStartTime(Date.now());
      setSimuladoResult(null);
      setCurrentSimuladoAnswers([]); 
    }
  }, [activePackageId]);

  // Busca as missões recentes salvas no banco para o usuário logado
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

  // ── MOTOR DE FILTRAGEM UNIFICADO E RESTAURADO (GITHUB SYNC) ──
  const displayedQuestions = useMemo(() => {
    if (activePackageId === 'simulado_teste_info') {
      const infoQuestions = db.questions.filter((q: Question) => {
        if (!q.discipline) return false;
        const disciplineName = q.discipline.toLowerCase();
        return disciplineName.includes('informática') || disciplineName.includes('informatica');
      });
      return shuffleArray(infoQuestions).slice(0, 5);
    }

    if (selectedFilters !== null) {
      let filtered = [...db.questions];

      // Filtro por Disciplina Única (Cliques rápidos na Home - Singular)
      if (selectedFilters.discipline && selectedFilters.discipline.trim() !== '') {
        const targetDisc = selectedFilters.discipline.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.discipline?.trim().toLowerCase() === targetDisc);
      }

      // Filtro por Múltiplas Disciplinas (Vindo do CustomTraining - Array Plural)
      if (selectedFilters.disciplines && Array.isArray(selectedFilters.disciplines) && selectedFilters.disciplines.length > 0) {
        const cleanedSelected = selectedFilters.disciplines.map((d: string) => d.trim().toLowerCase());
        filtered = filtered.filter((q: Question) => {
          if (!q.discipline) return false;
          return cleanedSelected.includes(q.discipline.trim().toLowerCase());
        });
      }

      // Filtro por Tópicos Múltiplos ou Único (Vindo do CustomTraining)
      if (selectedFilters.topics && Array.isArray(selectedFilters.topics) && selectedFilters.topics.length > 0) {
        const cleanedTopics = selectedFilters.topics.map((t: string) => t.trim().toLowerCase());
        filtered = filtered.filter((q: Question) => {
          if (!q.topic) return false;
          return cleanedTopics.includes(q.topic.trim().toLowerCase());
        });
      }
      if (selectedFilters.topic && selectedFilters.topic.trim() !== '') {
        const targetTopic = selectedFilters.topic.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.topic?.trim().toLowerCase() === targetTopic);
      }

      // Filtro por Carreira / Classe de Concurso
      if (selectedFilters.contestClass && selectedFilters.contestClass.trim() !== '') {
        const targetClass = selectedFilters.contestClass.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.contestClass?.trim().toLowerCase() === targetClass);
      }

      // Filtro por Banca (Ignora strings vazias "" de "Todas")
      if (selectedFilters.board && selectedFilters.board.trim() !== '') {
        const targetBoard = selectedFilters.board.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.board?.trim().toLowerCase() === targetBoard);
      }

      // Filtro por Ano (Seguro contra tipos text/number)
      if (selectedFilters.year && String(selectedFilters.year).trim() !== '') {
        const targetYear = String(selectedFilters.year).trim();
        filtered = filtered.filter((q: Question) => String(q.year).trim() === targetYear);
      }

      // Filtro por Dificuldade
      if (selectedFilters.difficulty && selectedFilters.difficulty.trim() !== '') {
        const targetDiff = selectedFilters.difficulty.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.difficulty?.trim().toLowerCase() === targetDiff);
      }

      // Filtro por Órgão / Instituição
      if (selectedFilters.institution && selectedFilters.institution.trim() !== '') {
        const targetInst = selectedFilters.institution.trim().toLowerCase();
        filtered = filtered.filter((q: Question) => q.institution?.trim().toLowerCase() === targetInst);
      }

      // Filtro Ocultar Respondidas (Histórico Inédito)
      if ((selectedFilters.hideAnswered || selectedFilters.answeredQuestionIds) && selectedFilters.answeredQuestionIds?.length > 0) {
        const answeredIds = selectedFilters.answeredQuestionIds.map((id: any) => String(id));
        filtered = filtered.filter((q: Question) => !answeredIds.includes(String(q.id)));
      }

      const shuffled = shuffleArray(filtered);
      const limit = parseInt(selectedFilters.limit);
      return isNaN(limit) ? shuffled : shuffled.slice(0, limit);
    }

    return shuffleArray(db.questions).slice(0, 20);
  }, [db.questions, selectedFilters, activePackageId]);

  const handleCalculateResult = () => {
    const endTime = Date.now();
    const timeSpentMs = endTime - simuladoStartTime;
    const total = displayedQuestions.length;
    const correct = currentSimuladoAnswers.filter(a => a.isCorrect).length;
    const rate = total > 0 ? (correct / total) * 100 : 0;

    const disciplineMap: Record<string, { correct: number; total: number }> = {};
    displayedQuestions.forEach(q => {
      if (!disciplineMap[q.discipline]) disciplineMap[q.discipline] = { correct: 0, total: 0 };
      disciplineMap[q.discipline].total++;
    });

    currentSimuladoAnswers.forEach(a => {
      if (disciplineMap[a.discipline]) {
        if (a.isCorrect) disciplineMap[a.discipline].correct++;
      }
    });

    const disciplineStats = Object.entries(disciplineMap).map(([name, data]) => ({
      name,
      correct: data.correct,
      total: data.total,
      rate: Math.round((data.correct / data.total) * 100)
    }));

    const totalSeconds = Math.floor(timeSpentMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    const timeString = hours > 0 ? `${hours}h ${minutes}m ${remainingSeconds}s` : `${minutes}m ${remainingSeconds}s`;

    setSimuladoResult({ total, correct, rate: rate.toFixed(1), timeString, disciplineStats });
  };

  const resetMission = (newPage: string) => {
    setCurrentPage(newPage);
    setSelectedFilters(null);
    setActivePackageId(null);
    setShowCustomConfig(false);
    setSimuladoResult(null);
    setCurrentSimuladoAnswers([]);
  };

  const renderStudent = () => {
    if (currentPage === 'performance') return <StudentDashboard attempts={userAttempts} />;
    if (currentPage === 'profile') return <UserProfile />;

    if (currentPage === 'free-study') {
      if (!selectedFilters && !showCustomConfig) {
        return (
          <TargetSelector
            tags={db.tags}
            questions={db.questions}
            savedScenarios={savedScenarios} // Mostra as missões pretas salvas na Home
            onSelect={(f: any) => f.isCustom ? setShowCustomConfig(true) : setSelectedFilters(f)}
          />
        );
      }
      if (showCustomConfig && !selectedFilters) {
        return (
          <CustomTraining
            tags={db.tags}
            userId={session?.user?.id} // Injeta o ID do usuário logado para habilitar salvamento
            answeredQuestionIds={userAttempts.map(a => String(a.questionId))} // Repassa os IDs respondidos
            onStart={(f: any) => setSelectedFilters(f)}
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
      if (simuladoResult) {
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4">
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 bg-primary/10 text-primary border border-primary/20 rounded-[2rem] shadow-xl shadow-primary/5">
                <Award className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">Relatório Operacional</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Desempenho consolidado do simulado</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem] flex flex-col justify-between group hover:border-primary/50 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Índice de Acertos</span>
                <p className="text-4xl font-black italic text-primary tracking-tighter mt-4">{simuladoResult.correct} <span className="text-sm font-normal text-white/30">de {simuladoResult.total} Qs</span></p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem] flex flex-col justify-between group hover:border-cyan-400 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Precisão Geral</span>
                <p className="text-4xl font-black italic text-cyan-400 tracking-tighter mt-4">{simuladoResult.rate}%</p>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-6 rounded-[2rem] flex flex-col justify-between group hover:border-amber-400 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Tempo Decorrido</span>
                <p className="text-2xl font-black italic text-amber-400 tracking-tight mt-6">{simuladoResult.timeString}</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem]">
              <h3 className="text-white font-black uppercase italic tracking-tighter text-lg mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Domínio por Área Temática
              </h3>
              <div className="space-y-6">
                {simuladoResult.disciplineStats.map((d: any) => (
                  <div key={d.name} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                      <span className="text-white/70">{d.name}</span>
                      <span className={d.rate >= 70 ? "text-primary" : "text-red-500"}>
                        {d.correct}/{d.total} ({d.rate}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${d.rate >= 70 ? 'bg-primary' : 'bg-red-500'}`} style={{ width: `${d.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => resetMission('my-packages')} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-primary hover:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Voltar aos Simulados
            </button>
          </div>
        );
      }

      if (activePackageId === 'simulado_teste_info') {
        return (
          <div className="space-y-6">
            <SimuladoHUD durationMinutes={15} title="Simulado Teste: Informática" onTimeOut={handleCalculateResult} onCancel={() => setActivePackageId(null)} />
            <QuestionViewer 
              questions={displayedQuestions} 
              onAnswer={(attempt) => {
                addAttempt(attempt); 
                setCurrentSimuladoAnswers(prev => [...prev, attempt]); 
              }} 
              onFinishSimulado={handleCalculateResult}
            />
          </div>
        );
      }
      return <SimuladosPage onSelectSimulado={(id: string) => setActivePackageId(id)} />;
    }
    return null;
  };

  if (authLoading || loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-primary font-black uppercase tracking-widest">Sincronizando Base...</p>
    </div>
  );

  if (!session) return <Auth onLoginSuccess={() => {}} />;
  if (!isPaid) return <PaymentGate />;

  return (
    <Layout currentPage={currentPage} setCurrentPage={resetMission} connectionStatus={connectionStatus}>
      {renderStudent()}
    </Layout>
  );
};

interface SimuladoHUDProps {
  durationMinutes: number;
  title: string;
  onTimeOut: () => void;
  onCancel: () => void;
}

const SimuladoHUD: React.FC<SimuladoHUDProps> = ({ durationMinutes, title, onTimeOut, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  useEffect(() => {
    if (timeLeft <= 0) { onTimeOut(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeOut]);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white/40 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-[2.5rem] backdrop-blur-sm shadow-xl">
      <div>
        <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">Modo Teste Controlado</span>
        <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-mono font-black text-lg transition-all ${timeLeft < 300 ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' : 'border-primary text-primary bg-primary/5'}`}>
          <Clock className="w-5 h-5" />
          <span>{formatCountdown(timeLeft)}</span>
        </div>
        <button onClick={() => { if (confirm("Deseja encerrar o teste?")) onTimeOut(); }} className="px-5 py-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-wider">Finalizar</button>
      </div>
    </div>
  );
};

export default App;