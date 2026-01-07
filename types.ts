
export type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface Option {
  id: string;
  label: string; 
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  comment: string;
  isAI?: boolean;
  institution: string;
  position: string;
  board: string;
  year: string;
  discipline: string;
  topic: string;
  difficulty: Difficulty;
  contestClass: string;
  createdAt: number;
}

export interface QuestionPackage {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  createdAt: number;
}

export interface UserAttempt {
  id: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: number;
  timeSpent?: number;
  discipline: string;
  topic: string;
  isAI?: boolean;
  userId?: string;
}

export interface Tags {
  institutions: string[];
  positions: string[];
  boards: string[];
  disciplines: string[];
  topics: Record<string, string[]>;
  contestClasses: string[];
  years: string[];
}

export interface AppState {
  questions: Question[];
  packages: QuestionPackage[];
  tags: Tags;
  attempts: UserAttempt[];
}
