import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Question, QuestionPackage, Tags, UserAttempt, AppState } from './types';
import { INITIAL_TAGS, INITIAL_QUESTIONS, INITIAL_PACKAGES } from './constants';

// Converte options do formato do banco { "A": "texto", "B": "texto" }
// para o formato esperado pelo app [{ id: "a", label: "A", text: "texto" }]
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
        id: String.fromCharCode(97 + i),
        label: String.fromCharCode(65 + i),
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

  // Normaliza correctOptionId para minúsculo (banco tem "A", app usa "a")
  const correctOptionId = q.correctOptionId
    ? q.correctOptionId.toLowerCase()
    : '';

  return { ...q, options, correctOptionId };
};

const parsePackage = (p: any): QuestionPackage => ({
  ...p,
  questionIds: typeof p.questionIds === 'string'
    ? JSON.parse(p.questionIds)
    : (Array.isArray(p.questionIds) ? p.questionIds : []),
});

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

      const [qRes, pRes, aRes] = await Promise.all([
        supabase.from('questions').select('*').order('createdAt', { ascending: false }),
        supabase.from('packages').select('*'),
        supabase.from('attempts').select('*').order('timestamp', { ascending: false })
      ]);

      setDb({
        questions: (qRes.data && qRes.data.length > 0)
          ? qRes.data.map(parseQuestion)
          : INITIAL_QUESTIONS,
        packages: (pRes.data && pRes.data.length > 0)
          ? pRes.data.map(parsePackage)
          : INITIAL_PACKAGES,
        attempts: aRes.data || [],
        tags: tData || INITIAL_TAGS
      });

    } catch (error) {
      setConnectionStatus('error');
      setDb(prev => ({
        ...prev,
        questions: INITIAL_QUESTIONS,
        packages: INITIAL_PACKAGES,
        tags: INITIAL_TAGS
      }));
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

  const addAttempt = async (a: UserAttempt) => {
    const { id, ...attemptData } = a;
    await supabase.from('attempts').insert([attemptData]);
    setDb(prev => ({ ...prev, attempts: [...prev.attempts, a] }));
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