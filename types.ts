
export enum AppView {
  DASHBOARD = 'dashboard',
  LESSONS = 'lessons',
  PRACTICE = 'practice',
  AI_COACH = 'ai_coach',
  ADMIN = 'admin'
}

export interface Lesson {
  id: string;
  title: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  thumbnail: string;
  description: string;
  audioUrl?: string;
}

export interface RhythmPattern {
  name: string;
  tempo: number;
  notation: string;
}
