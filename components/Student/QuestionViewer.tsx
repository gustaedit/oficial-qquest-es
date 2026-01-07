
import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAttempt } from '../../types';
import { 
  ChevronRight, Check, X, Cpu, MessageSquare, BarChart2, Star, Share2, AlertTriangle, BookOpen, Target, ArrowRight, Clock
} from 'lucide-react';

interface QuestionViewerProps {
  questions: Question[];
  onAnswer: (attempt: UserAttempt) => void;
  title?: string;
  onRefreshAI?: () => void;
  isGenerating?: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({ questions, onAnswer, title, onRefreshAI, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  // Inicia cronômetro quando a questão muda
  useEffect(() => {
    setSeconds(0);
    startTimeRef.current = Date.now();
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIndex]);

  // Para o cronômetro ao responder
  useEffect(() => {
    if (hasAnswered && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [hasAnswered]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered) {
        if (e.key === 'Enter' || e.key === ' ') nextQuestion();
        return;
      }
      const keys = ['1', '2', '3', '4', '5', 'a', 'b', 'c', 'd', 'e'];
      const index = keys.indexOf(e.key.toLowerCase());
      if (index !== -1 && index < currentQuestion?.options.length) {
        setSelectedOptionId(currentQuestion.options[index % 5].id);
      }
      if (e.key === 'Enter' && selectedOptionId) handleConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOptionId, hasAnswered, currentQuestion]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="relative mb-10">
          <div className="w-32 h-32 border-8 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-cyan-400" />
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-cyan-500 italic">Sintetizando</h3>
          <p className="text-gray-500 dark:text-white/20 text-[10px] font-black uppercase tracking-widest">Aguarde a geração do novo cenário tático...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleConfirm = () => {
    if (!selectedOptionId || hasAnswered) return;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const timeTaken = Date.now() - startTimeRef.current;
    
    setHasAnswered(true);
    setShowSolution(true);
    
    onAnswer({
      id: Math.random().toString(36).substr(2, 9),
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect,
      timestamp: Date.now(),
      timeSpent: timeTaken,
      discipline: currentQuestion.discipline,
      topic: currentQuestion.topic,
      isAI: currentQuestion.isAI
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setHasAnswered(false);
      setShowSolution(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentQuestion.isAI && onRefreshAI) {
      onRefreshAI();
      setSelectedOptionId(null);
      setHasAnswered(false);
      setShowSolution(false);
    }
  };

  const themeColor = currentQuestion.isAI ? 'text-cyan-500' : 'text-primary';
  const themeBg = currentQuestion.isAI ? 'bg-cyan-500/10' : 'bg-primary/10';
  const themeBorder = currentQuestion.isAI ? 'border-cyan-500' : 'border-primary';

  return (
    <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-8 py-6 bg-white/40 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded-[2.5rem] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className={`${themeBg} ${themeColor} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20`}>
            {currentQuestion.board}
          </span>
          <span className="text-gray-900 dark:text-white/80 font-black uppercase tracking-tighter text-xs">
            {currentQuestion.institution} • {currentQuestion.year}
          </span>
        </div>
        <div className="flex items-center gap-8">
           {/* CRONÔMETRO TÁTICO */}
           <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${hasAnswered ? 'border-gray-400 text-gray-400' : themeBorder + ' ' + themeColor} transition-all`}>
              <Clock className={`w-4 h-4 ${!hasAnswered && 'animate-pulse'}`} />
              <span className="text-sm font-black font-mono">{formatTime(seconds)}</span>
           </div>

           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-gray-500 dark:text-white/20 tracking-widest mb-1">Questão</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{currentIndex + 1} de {questions.length}</span>
           </div>
           <div className="w-px h-8 bg-gray-300 dark:bg-white/10" />
           <div className="flex items-center gap-2">
              <button className="p-3 text-gray-400 hover:text-primary transition-colors"><Star className="w-5 h-5" /></button>
              <button className="p-3 text-gray-400 hover:text-red-500 transition-colors"><AlertTriangle className="w-5 h-5" /></button>
           </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="relative mb-10 group">
        <div className={`p-10 md:p-14 bg-white dark:bg-black/40 border-l-[10px] ${themeBorder} border-y border-r border-gray-300 dark:border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500`}>
          
          {currentQuestion.isAI && (
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
              <Cpu className="w-40 h-40" />
            </div>
          )}

          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20 mb-8 flex items-center gap-3">
              <Target className={`w-4 h-4 ${themeColor}`} /> Comando de Operação
            </h4>
            <p className="text-xl md:text-2xl leading-relaxed font-bold text-gray-900 dark:text-white/90 tracking-tight mb-12 select-text">
              {currentQuestion.text}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.id === currentQuestion.correctOptionId;
                
                let btnStyle = "bg-gray-200/50 dark:bg-white/[0.03] border-gray-300 dark:border-white/5 hover:bg-gray-300 dark:hover:bg-white/[0.08] text-gray-800 dark:text-white/60";
                
                if (hasAnswered) {
                  if (isCorrect) btnStyle = "bg-emerald-500 text-black border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-[1.02] z-20";
                  else if (isSelected) btnStyle = "bg-red-500 text-black border-red-500 shadow-[0_10px_30px_rgba(239,68,68,0.3)]";
                  else btnStyle = "bg-transparent border-gray-300 dark:border-white/5 opacity-30 grayscale pointer-events-none";
                } else if (isSelected) {
                  btnStyle = `bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-[1.02] z-10`;
                }

                return (
                  <button 
                    key={opt.id}
                    disabled={hasAnswered}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`group flex items-start gap-6 p-6 border-2 rounded-3xl text-left transition-all duration-300 font-bold text-lg ${btnStyle}`}
                  >
                    <span className={`flex-none w-10 h-10 flex items-center justify-center text-sm font-black rounded-2xl border-2 transition-all ${
                      isSelected || (hasAnswered && isCorrect) ? 'border-transparent bg-black/20 text-current' : 'border-gray-400 dark:border-white/10'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 pt-1.5 leading-snug">{opt.text}</span>
                    {hasAnswered && isCorrect && <Check className="w-6 h-6 mt-1 shrink-0" />}
                    {hasAnswered && isSelected && !isCorrect && <X className="w-6 h-6 mt-1 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {!hasAnswered ? (
          <button 
            onClick={handleConfirm}
            disabled={!selectedOptionId}
            className={`w-full py-8 ${currentQuestion.isAI ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-primary shadow-primary/20'} text-black font-black uppercase tracking-[0.4em] text-sm rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-20 disabled:scale-100 flex items-center justify-center gap-4 active:scale-95`}
          >
            CONFIRMAR DISPARO <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowSolution(!showSolution)}
              className="flex-1 px-10 py-6 border-2 border-gray-900 dark:border-white/10 font-black uppercase tracking-widest text-[11px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white dark:hover:bg-white/5 transition-all active:scale-95 text-gray-900 dark:text-white"
            >
              <BookOpen className="w-5 h-5" /> {showSolution ? 'Fechar Resolução' : 'Ver Fundamentação'}
            </button>
            <button 
              onClick={nextQuestion}
              className={`flex-[1.5] py-6 ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-current/20`}
            >
              {currentIndex === questions.length - 1 && currentQuestion.isAI ? 'Nova Questão IA' : 'Próxima Missão'} <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Solution Block */}
      {hasAnswered && showSolution && (
        <div className="mt-10 animate-in slide-in-from-top-4 duration-500 pb-20">
           <div className="p-10 md:p-14 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-500 text-black rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                 </div>
                 <h5 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">Análise do Especialista</h5>
              </div>
              
              <p className="text-lg md:text-xl font-bold italic leading-relaxed text-gray-800 dark:text-white/80 border-l-4 border-emerald-500 pl-8">
                "{currentQuestion.comment}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-white dark:bg-black/40 rounded-3xl border border-gray-300 dark:border-white/10">
                    <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2"><Check className="w-4 h-4" /> Por que está correta?</h6>
                    <p className="text-xs text-gray-600 dark:text-white/40 font-bold">A fundamentação baseia-se na literalidade do texto constitucional e na jurisprudência pacificada do STF para este cargo.</p>
                 </div>
                 <div className="p-6 bg-white dark:bg-black/40 rounded-3xl border border-gray-300 dark:border-white/10">
                    <h6 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Cuidado com o erro</h6>
                    <p className="text-xs text-gray-600 dark:text-white/40 font-bold">Muitos candidatos confundem este prazo com o prazo de validade do concurso, o que é uma pegadinha clássica da banca.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Shortcuts Helper */}
      <div className="hidden lg:flex fixed bottom-10 left-10 p-5 bg-black/80 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl items-center gap-6 opacity-40 hover:opacity-100 transition-all z-50">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-black text-white">1-5</kbd>
            <span className="text-[9px] font-black text-white/40 uppercase">Escolher</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-black text-white">ENTER</kbd>
            <span className="text-[9px] font-black text-white/40 uppercase">Atirar</span>
          </div>
      </div>
    </div>
  );
};
