import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAttempt } from '../../types';
import {
  ChevronRight, ChevronLeft, Check, X, Cpu, MessageSquare,
  Star, AlertTriangle, BookOpen, Target, ArrowRight, Clock,
  Scissors, Send, ThumbsUp, User, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Comment {
  id: string;
  questionId: string;
  userEmail: string;
  text: string;
  likes: number;
  createdAt: number;
}

interface QuestionViewerProps {
  questions: Question[];
  onAnswer: (attempt: UserAttempt) => void;
  title?: string;
  onRefreshAI?: () => void;
  isGenerating?: boolean;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  questions, onAnswer, title, onRefreshAI, isGenerating
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cutOptions, setCutOptions] = useState<Set<string>>(new Set());
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIndex]
    ? (() => {
        const q = questions[currentIndex];
        let raw: any = q.options;
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = {}; } }
        let opts: any[];
        if (Array.isArray(raw)) {
          if (raw.length > 0 && raw[0].text !== undefined) { opts = raw; } 
          else {
            opts = raw.map((text: string, i: number) => ({
              id: String.fromCharCode(97 + i),
              label: String.fromCharCode(65 + i),
              text: String(text),
            }));
          }
        } else if (raw && typeof raw === 'object') {
          opts = Object.entries(raw).map(([label, text]) => ({
            id: label.toLowerCase(),
            label: label.toUpperCase(),
            text: String(text),
          }));
        } else { opts = []; }
        const correctId = q.correctOptionId ? q.correctOptionId.toLowerCase() : '';
        return { ...q, options: opts, correctOptionId: correctId };
      })()
    : null;

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const hasAnswered = !!currentAnswer;

  useEffect(() => {
    setSeconds(0);
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!hasAnswered) {
        timerIntervalRef.current = window.setInterval(() => {
          setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [currentIndex, hasAnswered]);

  useEffect(() => {
    if (showComments && currentQuestion) loadComments();
  }, [showComments, currentQuestion?.id]);

  const loadComments = async () => {
    if (!currentQuestion) return;
    setLoadingComments(true);
    try {
      const { data } = await supabase
        .from('question_comments')
        .select('*')
        .eq('questionId', currentQuestion.id)
        .not('id', 'like', 'bizu_%')
        .not('id', 'like', 'fav_%')
        .order('likes', { ascending: false })
        .limit(20);
      if (data) setComments(data);
    } catch (e) { console.warn('Erro ao carregar comentários', e); }
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !currentQuestion) return;
    setSendingComment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email || 'anônimo';
      const comment: Comment = {
        id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        questionId: currentQuestion.id,
        userEmail: email,
        text: newComment.trim(),
        likes: 0,
        createdAt: Date.now(),
      };
      await supabase.from('question_comments').insert([comment]);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (e) { console.warn('Erro ao enviar comentário', e); }
    setSendingComment(false);
  };

  const likeComment = async (commentId: string) => {
    if (likedIds.has(commentId)) return;
    setLikedIds(prev => new Set([...prev, commentId]));
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    try {
      const comment = comments.find(c => c.id === commentId);
      if (comment) await supabase.from('question_comments').update({ likes: comment.likes + 1 }).eq('id', commentId);
    } catch (e) { console.warn(e); }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!selectedOptionId || hasAnswered || !currentQuestion) return;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    const timeSpent = Date.now() - startTimeRef.current;

    const { data: { session } } = await supabase.auth.getSession();

    setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedOptionId
    }));

    setShowSolution(true);
    
    onAnswer({
      id: Math.random().toString(36).substr(2, 9),
      questionId: currentQuestion.id,
      userId: session?.user?.id,
      selectedOptionId,
      isCorrect,
      timestamp: Date.now(),
      timeSpent,
      discipline: currentQuestion.discipline,
      topic: currentQuestion.topic,
      isAI: currentQuestion.isAI,
    });
  };

  const goToQuestion = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return;
    setCurrentIndex(newIndex);
    setSelectedOptionId(null);
    setShowSolution(false);
    setCutOptions(new Set());
    setShowComments(false);
    setComments([]);
    setNewComment('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) { 
      goToQuestion(currentIndex + 1); 
    } else if (currentQuestion?.isAI && onRefreshAI) {
      onRefreshAI();
      setSelectedOptionId(null);
      setShowSolution(false);
    }
  };

  const prevQuestion = () => { 
    if (currentIndex > 0) goToQuestion(currentIndex - 1); 
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered) {
        if (e.key === 'ArrowRight') nextQuestion();
        if (e.key === 'ArrowLeft') prevQuestion();
        return;
      }
      const keys = ['1', '2', '3', '4', '5', 'a', 'b', 'c', 'd', 'e'];
      const index = keys.indexOf(e.key.toLowerCase());
      if (index !== -1 && index < (currentQuestion?.options.length ?? 0)) {
        const opt = currentQuestion.options[index % 5];
        if (!cutOptions.has(opt.id)) setSelectedOptionId(opt.id);
      }
      if (e.key === 'Enter' && selectedOptionId) handleConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOptionId, hasAnswered, currentQuestion, cutOptions]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="relative mb-10">
          <div className="w-32 h-32 border-8 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-cyan-500 italic">Sintetizando</h3>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const themeColor = currentQuestion.isAI ? 'text-cyan-500' : 'text-primary';
  const themeBg    = currentQuestion.isAI ? 'bg-cyan-500/10' : 'bg-primary/10';
  const themeBorder= currentQuestion.isAI ? 'border-cyan-500' : 'border-primary';

  return (
    <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-500">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-6 py-5 bg-white/40 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded-[2.5rem] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className={`${themeBg} ${themeColor} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20`}>{currentQuestion.board}</span>
          <span className="text-gray-900 dark:text-white/80 font-black uppercase tracking-tighter text-xs">{currentQuestion.institution} • {currentQuestion.year}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${hasAnswered ? 'border-gray-400 text-gray-400' : `${themeBorder} ${themeColor}`} transition-all`}>
            <Clock className={`w-4 h-4 ${!hasAnswered && 'animate-pulse'}`} />
            <span className="text-sm font-black font-mono">{formatTime(seconds)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase text-gray-500 dark:text-white/20 tracking-widest mb-1">Questão</span>
            <span className="text-sm font-black text-gray-900 dark:text-white">{currentIndex + 1} de {questions.length}</span>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full mb-8 overflow-hidden">
        <div className={`h-full ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} transition-all duration-500`} style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* QUESTION CARD */}
      <div className="relative mb-10 group">
        <div className={`p-10 md:p-14 bg-white dark:bg-black/40 border-l-[10px] ${themeBorder} border-y border-r border-gray-300 dark:border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500`}>
          <div className="relative z-10">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20 mb-8 flex items-center gap-3`}><Target className={`w-4 h-4 ${themeColor}`} /> Enunciado</h4>
            <p className="text-xl md:text-2xl leading-relaxed font-bold text-gray-900 dark:text-white/90 tracking-tight mb-12 select-text">{currentQuestion.text}</p>
            
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, idx) => {
    // Lógica de seleção efetiva (usa o que está salvo se houver)
    const effectiveSelectionId = currentAnswer || selectedOptionId;
    
    // Normalização preventiva para evitar quebra de maiúsculas/minúsculas
    const isSelected = effectiveSelectionId?.toLowerCase() === opt.id.toLowerCase();
    const isCorrect  = opt.id.toLowerCase() === currentQuestion.correctOptionId.toLowerCase();
    const isCut      = cutOptions.has(opt.id);

    let btnStyle = 'bg-gray-200/50 dark:bg-white/[0.03] border-gray-300 dark:border-white/5 hover:bg-gray-300 dark:hover:bg-white/[0.08] text-gray-800 dark:text-white/60';

    if (isCut && !hasAnswered) { 
      btnStyle = 'bg-transparent border-gray-200 dark:border-white/[0.04] opacity-40 text-gray-400 dark:text-white/20'; 
    } else if (hasAnswered) {
      // Se for a alternativa correta da questão, aplica o verde tático independente de o usuário ter acertado ou errado
      if (isCorrect)       btnStyle = 'bg-emerald-500 text-black border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-[1.02] z-20';
      else if (isSelected) btnStyle = 'bg-red-500 text-black border-red-500 shadow-[0_10px_30px_rgba(239,68,68,0.3)]';
      else                 btnStyle = 'bg-transparent border-gray-300 dark:border-white/5 opacity-30 grayscale pointer-events-none';
    } else if (isSelected) { 
      btnStyle = 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-[1.02] z-10'; 
    }
                return (
                  <div key={opt.id} className="relative group/opt">
                    <button
                      disabled={hasAnswered || isCut}
                      onClick={() => { if (!hasAnswered && !isCut) setSelectedOptionId(opt.id); }}
                      className={`w-full flex items-start gap-6 p-6 pr-14 border-2 rounded-3xl text-left transition-all duration-300 font-bold text-lg ${btnStyle}`}
                    >
                      <span className={`flex-none w-10 h-10 flex items-center justify-center text-sm font-black rounded-2xl border-2 transition-all ${
                        isSelected || (hasAnswered && isCorrect) ? 'border-transparent bg-black/20 text-current' : isCut ? 'border-gray-200 dark:border-white/5 text-gray-300 dark:text-white/10' : 'border-gray-400 dark:border-white/10'
                      }`}>{String.fromCharCode(65 + idx)}</span>
                      <span className={`flex-1 pt-1.5 leading-snug ${isCut && !hasAnswered ? 'line-through' : ''}`}>{opt.text}</span>
                      {hasAnswered && isCorrect   && <Check className="w-6 h-6 mt-1 shrink-0" />}
                      {hasAnswered && isSelected  && !isCorrect && <X className="w-6 h-6 mt-1 shrink-0" />}
                    </button>
                    {!hasAnswered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCutOptions(prev => {
                            const n = new Set(prev);
                            n.has(opt.id) ? n.delete(opt.id) : n.add(opt.id);
                            return n;
                          });
                          if (selectedOptionId === opt.id) setSelectedOptionId(null);
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${isCut ? 'bg-amber-400/20 text-amber-500 opacity-100' : 'opacity-0 group-hover/opt:opacity-70 bg-gray-200/80 dark:bg-white/10'}`}
                      ><Scissors className="w-4 h-4" /></button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO E CONTROLES */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Botão Anterior */}
        <button 
          onClick={prevQuestion} 
          disabled={currentIndex === 0}
          className="w-full sm:w-auto px-8 py-6 border-2 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/40 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5" /> Anterior
        </button>

        {!hasAnswered ? (
          <button 
            onClick={handleConfirm} 
            disabled={!selectedOptionId} 
            className={`flex-1 w-full py-8 ${currentQuestion?.isAI ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-primary shadow-primary/20'} text-black font-black uppercase tracking-[0.4em] text-sm rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-20 flex items-center justify-center gap-4 active:scale-95`}
          >
            CONFIRMAR <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => { setShowSolution(s => !s); setShowComments(false); }} 
              className="flex-1 px-8 py-6 border-2 border-gray-900 dark:border-white/10 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white dark:hover:bg-white/5 transition-all text-gray-900 dark:text-white"
            >
              <BookOpen className="w-5 h-5" /> {showSolution ? 'Fechar' : 'Fundamentação'}
            </button>
            <button 
              onClick={() => { setShowComments(s => !s); setShowSolution(false); }} 
              className="flex-1 px-8 py-6 border-2 border-blue-500/40 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-blue-500/5 transition-all"
            >
              <MessageSquare className="w-5 h-5" /> Bizus {comments.length > 0 && <span className="bg-blue-500 text-white text-[9px] rounded-full px-2 py-0.5 ml-1">{comments.length}</span>}
            </button>
          </div>
        )}

        {/* Botão Próxima */}
        <button 
          onClick={nextQuestion} 
          disabled={!hasAnswered && currentIndex === questions.length - 1 && !currentQuestion?.isAI}
          className={`w-full sm:w-auto px-8 py-6 ${hasAnswered ? 'bg-primary text-black' : 'border-2 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/40'} font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20`}
        >
          Próxima <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* BLOCOS DE FUNDAMENTAÇÃO E COMENTÁRIOS IGUAIS AO SEU... (omitidos para poupar espaço) */}
    </div>
  );
};