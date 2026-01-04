
export enum Subject {
  PORTUGUESE = "Língua Portuguesa",
  MATHEMATICS = "Matemática",
  GENERAL_KNOWLEDGE = "Conhecimentos Gerais",
  COMPUTER_SCIENCE = "Noções de Informática",
  ADMIN_LAW = "Noções de Administração Pública",
}

export type ThemeMode = 'light' | 'dark' | 'dynamic';

export interface UserProfile {
  name: string;
  email: string;
  theme: ThemeMode;
  avatarSeed?: string;
  photoURL?: string;
}

export interface Question {
  id: string;
  subject: Subject;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MockExam {
  id: string;
  title: string;
  questions: Question[];
  durationMinutes: number;
}

export interface MockExamResult {
  examId: string;
  score: number;
  total: number;
  answers: Record<string, number>; // questionId -> selectedOptionIdx
  timeSpentMinutes: number;
  subjectBreakdown: Record<Subject, { correct: number, total: number }>;
}

export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  date?: string;
}

export interface StudySlot {
  id: string;
  subject: Subject;
  dayOfWeek: number; // 0-6
  time: string; // "HH:mm"
  active: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 a 100
  category: 'estudo' | 'simulado' | 'social';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
