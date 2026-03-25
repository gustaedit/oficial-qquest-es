import React, { useState, useEffect, useRef } from 'react';
import { Question, UserAttempt } from '../../types';
import {
  ChevronRight, ChevronLeft, Check, X, Cpu, MessageSquare,
  Star, AlertTriangle, BookOpen, Target, ArrowRight, Clock,
  Scissors, Send, ThumbsUp, User
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
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // ── TESOURA ──
  const [cutOptions, setCutOptions] = useState<Set<string>>(new Set());

  // ── TIMER ──
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // ── COMENTÁRIOS DA COMUNIDADE ──
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [myBizu, setMyBizu] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIndex]
    ? (() => {
        const q = questions[currentIndex];
        let raw: any = q.options;

        // Se vier como string, faz parse
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { raw = {}; }
        }

        let opts: any[];

        if (Array.isArray(raw)) {
          // Formato esperado: [{id, label, text}]
          // Mas verifica se os itens têm a estrutura certa
          if (raw.length > 0 && raw[0].text !== undefined) {
            opts = raw;
          } else {
            // Array de strings simples
            opts = raw.map((text: string, i: number) => ({
              id: String.fromCharCode(97 + i),
              label: String.fromCharCode(65 + i),
              text: String(text),
            }));
          }
        } else if (raw && typeof raw === 'object') {
          // Formato do banco: { "A": "texto...", "B": "texto..." }
          opts = Object.entries(raw).map(([label, text]) => ({
            id: label.toLowerCase(),
            label: label.toUpperCase(),
            text: String(text),
          }));
        } else {
          opts = [];
        }

        // Também normaliza o correctOptionId para minúsculo
        // pois o banco tem "A" mas o id gerado é "a"
        const correctId = q.correctOptionId
          ? q.correctOptionId.toLowerCase()
          : '';

        return { ...q, options: opts, correctOptionId: correctId };
      })()
    : null;

  // Timer
  useEffect(() => {
    setSeconds(0);
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [currentIndex]);

  useEffect(() => {
    if (hasAnswered && timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [hasAnswered]);

  // Carregar comentários quando abre fundamentação
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

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered) {
        if (e.key === 'Enter' || e.key === ' ') nextQuestion();
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
        <p className="text-gray-500 dark:text-white/20 text-[10px] font-black uppercase tracking-widest mt-4">Aguarde a geração do novo cenário tático...</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const handleConfirm = () => {
    if (!selectedOptionId || hasAnswered) return;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    setHasAnswered(true);
    setShowSolution(true);
    onAnswer({
      id: Math.random().toString(36).substr(2, 9),
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect,
      timestamp: Date.now(),
      timeSpent: Date.now() - startTimeRef.current,
      discipline: currentQuestion.discipline,
      topic: currentQuestion.topic,
      isAI: currentQuestion.isAI,
    });
  };

  const goToQuestion = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setSelectedOptionId(null);
    setHasAnswered(false);
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
    } else if (currentQuestion.isAI && onRefreshAI) {
      onRefreshAI();
      setSelectedOptionId(null);
      setHasAnswered(false);
      setShowSolution(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };

  const themeColor = currentQuestion.isAI ? 'text-cyan-500' : 'text-primary';
  const themeBg    = currentQuestion.isAI ? 'bg-cyan-500/10' : 'bg-primary/10';
  const themeBorder= currentQuestion.isAI ? 'border-cyan-500' : 'border-primary';

  return (
    <div className="max-w-4xl mx-auto py-2 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-6 py-5 bg-white/40 dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded-[2.5rem] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className={`${themeBg} ${themeColor} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20`}>
            {currentQuestion.board}
          </span>
          <span className="text-gray-900 dark:text-white/80 font-black uppercase tracking-tighter text-xs">
            {currentQuestion.institution} • {currentQuestion.year}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${hasAnswered ? 'border-gray-400 text-gray-400' : `${themeBorder} ${themeColor}`} transition-all`}>
            <Clock className={`w-4 h-4 ${!hasAnswered && 'animate-pulse'}`} />
            <span className="text-sm font-black font-mono">{formatTime(seconds)}</span>
          </div>

          {/* Contador de questão */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase text-gray-500 dark:text-white/20 tracking-widest mb-1">Questão</span>
            <span className="text-sm font-black text-gray-900 dark:text-white">{currentIndex + 1} de {questions.length}</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE PROGRESSO ── */}
      <div className="h-1 w-full bg-gray-200 dark:bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className={`h-full ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} transition-all duration-500`}
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ── CARD DA QUESTÃO ── */}
      <div className="relative mb-10 group">
        <div className={`p-10 md:p-14 bg-white dark:bg-black/40 border-l-[10px] ${themeBorder} border-y border-r border-gray-300 dark:border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500`}>
          {currentQuestion.isAI && (
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
              <Cpu className="w-40 h-40" />
            </div>
          )}

          <div className="relative z-10">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20 mb-8 flex items-center gap-3`}>
              <Target className={`w-4 h-4 ${themeColor}`} /> Enunciado
            </h4>

            <p className="text-xl md:text-2xl leading-relaxed font-bold text-gray-900 dark:text-white/90 tracking-tight mb-12 select-text">
              {currentQuestion.text}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect  = opt.id === currentQuestion.correctOptionId;
                const isCut      = cutOptions.has(opt.id);

                let btnStyle = 'bg-gray-200/50 dark:bg-white/[0.03] border-gray-300 dark:border-white/5 hover:bg-gray-300 dark:hover:bg-white/[0.08] text-gray-800 dark:text-white/60';

                if (isCut && !hasAnswered) {
                  btnStyle = 'bg-transparent border-gray-200 dark:border-white/[0.04] opacity-40 text-gray-400 dark:text-white/20';
                } else if (hasAnswered) {
                  if (isCorrect)       btnStyle = 'bg-emerald-500 text-black border-emerald-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-[1.02] z-20';
                  else if (isSelected) btnStyle = 'bg-red-500 text-black border-red-500 shadow-[0_10px_30px_rgba(239,68,68,0.3)]';
                  else                 btnStyle = 'bg-transparent border-gray-300 dark:border-white/5 opacity-30 grayscale pointer-events-none';
                } else if (isSelected) {
                  btnStyle = 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-[1.02] z-10';
                }

                return (
                  <div key={opt.id} className="relative group/opt">
                    {/* Alternativa principal */}
                    <button
                      disabled={hasAnswered || isCut}
                      onClick={() => { if (!hasAnswered && !isCut) setSelectedOptionId(opt.id); }}
                      className={`w-full flex items-start gap-6 p-6 pr-14 border-2 rounded-3xl text-left transition-all duration-300 font-bold text-lg ${btnStyle}`}
                    >
                      <span className={`flex-none w-10 h-10 flex items-center justify-center text-sm font-black rounded-2xl border-2 transition-all ${
                        isSelected || (hasAnswered && isCorrect)
                          ? 'border-transparent bg-black/20 text-current'
                          : isCut
                            ? 'border-gray-200 dark:border-white/5 text-gray-300 dark:text-white/10'
                            : 'border-gray-400 dark:border-white/10'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className={`flex-1 pt-1.5 leading-snug ${isCut && !hasAnswered ? 'line-through' : ''}`}>
                        {opt.text}
                      </span>
                      {hasAnswered && isCorrect   && <Check className="w-6 h-6 mt-1 shrink-0" />}
                      {hasAnswered && isSelected  && !isCorrect && <X className="w-6 h-6 mt-1 shrink-0" />}
                    </button>

                    {/* Botão tesoura — fixo à direita de cada alternativa */}
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
                        title={isCut ? 'Restaurar alternativa' : 'Eliminar alternativa'}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                          isCut
                            ? 'bg-amber-400/20 text-amber-500 rotate-0 opacity-100'
                            : 'opacity-0 group-hover/opt:opacity-70 hover:!opacity-100 bg-gray-200/80 dark:bg-white/10 text-gray-400 hover:bg-amber-400/20 hover:text-amber-500'
                        }`}
                      >
                        <Scissors className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTÕES DE CONTROLE ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Botão Voltar */}
        {currentIndex > 0 && (
          <button
            onClick={prevQuestion}
            className="sm:w-auto px-8 py-6 border-2 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/40 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:border-primary hover:text-primary transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>
        )}

        {!hasAnswered ? (
          <button
            onClick={handleConfirm}
            disabled={!selectedOptionId}
            className={`flex-1 py-8 ${currentQuestion.isAI ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-primary shadow-primary/20'} text-black font-black uppercase tracking-[0.4em] text-sm rounded-[2.5rem] shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-20 disabled:scale-100 flex items-center justify-center gap-4 active:scale-95`}
          >
            CONFIRMAR <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { setShowSolution(s => !s); setShowComments(false); }}
              className="flex-1 px-8 py-6 border-2 border-gray-900 dark:border-white/10 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-white dark:hover:bg-white/5 transition-all active:scale-95 text-gray-900 dark:text-white"
            >
              <BookOpen className="w-5 h-5" /> {showSolution ? 'Fechar' : 'Fundamentação'}
            </button>
            <button
              onClick={() => { setShowComments(s => !s); setShowSolution(false); }}
              className="flex-1 px-8 py-6 border-2 border-blue-500/40 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:bg-blue-500/5 transition-all active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              Comentários
              {comments.length > 0 && (
                <span className="bg-blue-500 text-white text-[9px] rounded-full px-2 py-0.5">{comments.length}</span>
              )}
            </button>
            <button
              onClick={nextQuestion}
              className={`flex-[1.5] py-6 ${currentQuestion.isAI ? 'bg-cyan-500' : 'bg-primary'} text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-[2rem] flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-current/20`}
            >
              {currentIndex === questions.length - 1 && currentQuestion.isAI ? 'Nova IA' : 'Próxima'} <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* ── BLOCO DE FUNDAMENTAÇÃO ── */}
      {hasAnswered && showSolution && (
        <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
          <div className="p-10 md:p-14 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-black rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-400">Análise do Especialista</h5>
            </div>
            <p className="text-lg md:text-xl font-bold italic leading-relaxed text-gray-800 dark:text-white/80 border-l-4 border-emerald-500 pl-8">
              "{currentQuestion.comment}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-black/40 rounded-3xl border border-gray-300 dark:border-white/10">
                <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Por que está correta?
                </h6>
                <p className="text-xs text-gray-600 dark:text-white/40 font-bold leading-relaxed">
                  A fundamentação baseia-se na literalidade do texto legal e na jurisprudência pacificada para este concurso.
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-black/40 rounded-3xl border border-gray-300 dark:border-white/10">
                <h6 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Cuidado com o erro
                </h6>
                <p className="text-xs text-gray-600 dark:text-white/40 font-bold leading-relaxed">
                  Fique atento às pegadinhas clássicas da banca — confusão de prazos, inversão de conceitos e exceções à regra geral.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BLOCO DE COMENTÁRIOS DA COMUNIDADE ── */}
      {hasAnswered && showComments && (
        <div className="mt-8 animate-in slide-in-from-top-4 duration-500 pb-20">
          <div className="p-8 md:p-12 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] space-y-8">

            {/* Cabeçalho */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Bizus & Comentários da Turma</h5>
                <p className="text-[10px] text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest mt-1">
                  Compartilhe jurisprudência, macetes e linhas de raciocínio
                </p>
              </div>
            </div>

            {/* Campo para novo comentário */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30">
                Seu bizu para esta questão:
              </label>
              <div className="flex gap-3">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ex: Lembrar que o STF entendeu que... / Macete: a banca cobra sempre..."
                  rows={3}
                  className="flex-1 bg-white dark:bg-black/40 border-2 border-gray-300 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20 outline-none focus:border-blue-500 transition-all resize-none"
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || sendingComment}
                  className="flex-none w-14 h-auto bg-blue-500 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-30 active:scale-95"
                >
                  {sendingComment
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-4">
              {loadingComments && (
                <div className="text-center py-8 text-gray-400 dark:text-white/20 text-sm font-bold">
                  Carregando comentários...
                </div>
              )}

              {!loadingComments && comments.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl">
                  <MessageSquare className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-white/20 text-[11px] font-black uppercase tracking-widest">
                    Seja o primeiro a comentar!
                  </p>
                </div>
              )}

              {comments.map(comment => (
                <div key={comment.id} className="p-5 bg-white dark:bg-black/30 rounded-3xl border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white/30">
                        {comment.userEmail.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => likeComment(comment.id)}
                      disabled={likedIds.has(comment.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        likedIds.has(comment.id)
                          ? 'bg-blue-500/10 text-blue-500 cursor-default'
                          : 'border border-gray-300 dark:border-white/10 text-gray-400 hover:border-blue-400 hover:text-blue-500 active:scale-95'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {comment.likes > 0 && comment.likes}
                    </button>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white/70 leading-relaxed pl-9">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ATALHOS ── */}
      <div className="hidden lg:flex fixed bottom-10 left-10 p-5 bg-black/80 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl items-center gap-6 opacity-40 hover:opacity-100 transition-all z-50">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-black text-white">1-5</kbd>
          <span className="text-[9px] font-black text-white/40 uppercase">Escolher</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] font-black text-white/40 uppercase">✂️ Ao lado de cada opção</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-black text-white">ENTER</kbd>
          <span className="text-[9px] font-black text-white/40 uppercase">Confirmar</span>
        </div>
      </div>
    </div>
  );
};