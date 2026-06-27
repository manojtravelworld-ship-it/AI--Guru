export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export type RoleType = 'student' | 'teacher' | 'parent' | 'admin';

export type PortalType = 
  | 'learning' 
  | 'knowledge' 
  | 'exam' 
  | 'voice' 
  | 'teacher' 
  | 'parent' 
  | 'brain' 
  | 'system';

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  syllabus: 'NCERT' | 'SCERT' | 'Other';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  summary: string;
  content: string;
  objectives: string[];
}

export interface TextbookChapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  concepts: string[];
}

export interface Textbook {
  id: string;
  title: string;
  subject: string;
  grade: string;
  syllabus: 'NCERT' | 'SCERT Kerala';
  chapters: TextbookChapter[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface MockTest {
  id: string;
  title: string;
  category: 'JEE' | 'NEET' | 'KEAM' | 'CUET' | 'General';
  durationMinutes: number;
  questions: ExamQuestion[];
}

export interface BrainModel {
  id: string;
  name: string;
  type: 'Primary' | 'Offline Fallback';
  provider: string;
  costPerToken: string;
  latencyMs: number;
  isActive: boolean;
}

export interface VoiceNarration {
  id: string;
  title: string;
  language: 'English' | 'Malayalam';
  duration: string;
  narrator: string;
  text: string;
}
