import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Question, QuestionPackage, Tags, UserAttempt, AppState } from './types';
import { INITIAL_TAGS, INITIAL_QUESTIONS, INITIAL_PACKAGES } from './constants';

// Converte options do formato do banco para o formato esperado pelo app
const parseQuestion = (q: any): Question => {
  let raw: any = q.options;

  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = {}; }
  }

  let options: any[];

  if (Array.isArray(raw)) {
    if (raw.length > 0 && raw[0]?.text !== undefined) {
      options = raw; // já no formato correto
    } else {
      options = raw.map((text: string, i: number) => ({
        id: String.fromCharCode(97 + i), // a, b, c...
        label: String.fromCharCode(65 + i), // A, B, C...
        text: String(text),
      }));
    }
  } else if (raw && typeof raw === 'object') {
    // Formato banco: { "A": "texto", "B": "texto" }
    options = Object.entries(raw).map(([label, text]) => ({
      id: label.toLowerCase(),
      label: label.toUpperCase(),
      text: String(text),
    }));
  } else {
    options = [];
  }

  // ── PROTEÇÃO TÁTICA: Normalização e Conversão de IDs do CSV ──
  const normalizedOptions = options.map((opt: any) => ({
    ...opt,
    id: String(opt.id).toLowerCase()
  }));

  const correctOptionId = q.correctOptionId
    ? String(q.correctOptionId).toLowerCase()
    : '';

  return { 
    ...q, 
    id: String(q.id), 
    options: normalizedOptions, 
    correctOptionId 
  };
};

const parsePackage = (p: any): QuestionPackage => {
  let rawIds: any[] = [];
  
  if (typeof p.questionIds === 'string') {
    try { rawIds = JSON.parse(p.questionIds); } catch { rawIds = []; }
  } else if (Array.isArray(p.questionIds)) {
    rawIds = p.questionIds;
  }

  return {
    ...p,
    id: String(p.id),
    questionIds: rawIds.map((id: any) => String(id)),
    year: p.year || 'OFICIAL',
    institution: p.institution || 'PROVA',
    duration_minutes: p.duration_minutes || 270 
  };
};

export function useStorage() {
  const [db, setDb] = useState<AppState>({
    questions: [],
    packages: [],
    tags: INITIAL_TAGS,
    attempts: []
  });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'error'>('offline');

  const syncWithBackend = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tData, error: tError } = await supabase
        .from('tags')
        .select('*')
        .eq('id', 'global_config')
        .maybeSingle();

      if (tError) {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('online');
      }

      // ── PAGINAÇÃO COLETIVA EM PARALELO ──
      // Puxa o lote 1 (0 a 1000) e o lote 2 (1001 a 2000) de uma vez só
      const [qRes1, qRes2, pRes] = await Promise.all([
        supabase.from('questions').select('*').range(0, 999).order('createdAt', { ascending: false }),
        supabase.from('questions').select('*').range(1000, 1999).order('createdAt', { ascending: false }),
        supabase.from('packages').select('*')
      ]);

      // Unifica os dois lotes em um array único de questões
      const allQuestionsData = [
        ...(qRes1.data || []),
        ...(qRes2.data || [])
      ];

      const localAttemptsRaw = localStorage.getItem('operacao_backlogs');
      let localAttempts: any[] = [];
      if (localAttemptsRaw) {
        try { localAttempts = JSON.parse(localAttemptsRaw); } catch { localAttempts = []; }
      }

      setDb({
        // Entrega todas as 1600+ questões processadas para o estado global
        questions: (allQuestionsData.length > 0)
          ? allQuestionsData.map(parseQuestion)
          : INITIAL_QUESTIONS.map(parseQuestion),
        packages: (pRes.data && pRes.data.length > 0)
          ? pRes.data.map(parsePackage)
          : INITIAL_PACKAGES.map(parsePackage),
        attempts: localAttempts.map(a => ({
          ...a,
          id: String(a.id || ''),
          questionId: String(a.questionId || ''),
          userId: String(a.userId || '')
        })),
        tags: tData || INITIAL_TAGS
      });

    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const addQuestion = async (q: Question) => {
    const { error } = await supabase.from('questions').insert([q]);
    if (error) return false;
    setDb(prev => ({ ...prev, questions: [parseQuestion(q), ...prev.questions] }));
    return true;
  };

  const updateQuestion = async (q: Question) => {
    const { error } = await supabase.from('questions').update(q).eq('id', q.id);
    if (error) return false;
    setDb(prev => ({
      ...prev,
      questions: prev.questions.map(item => item.id === q.id ? parseQuestion(q) : item)
    }));
    return true;
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) {
      setDb(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
      return true;
    }
    return false;
  };

  const updateTags = async (t: Tags) => {
    const { error } = await supabase.from('tags').upsert([{ id: 'global_config', ...t }]);
    if (!error) setDb(prev => ({ ...prev, tags: t }));
  };

  const addPackage = async (p: QuestionPackage) => {
    const { error } = await supabase.from('packages').insert([p]);
    if (!error) setDb(prev => ({ ...prev, packages: [parsePackage(p), ...prev.packages] }));
  };

  // ── GRAVAÇÃO TEMPORÁRIA LOCAL (SEM ENVIAR PARA O SUPABASE) ──
  const addAttempt = async (a: UserAttempt) => {
    setDb(prev => {
      const updatedAttempts = [a, ...prev.attempts];
      
      // Salva a lista de respostas diretamente no HD do navegador do usuário
      localStorage.setItem('operacao_backlogs', JSON.stringify(updatedAttempts));
      
      return { 
        ...prev, 
        attempts: updatedAttempts 
      };
    });
  };

  return {
    db,
    loading,
    connectionStatus,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    updateTags,
    addPackage,
    addAttempt,
    refresh: syncWithBackend
  };
}