
export enum AppView {
  DASHBOARD = 'dashboard',
  LIBRARY = 'library',
  PRACTICE = 'practice'
}

export interface Track {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  level?: string;
  duration?: string;
  bpm?: number;
}

export interface RhythmPattern {
  name: string;
  tempo: number;
  notation: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: string;
  duration: string;
  thumbnail: string;
  description: string;
  audioUrl: string;
  bpm: number;
}

export interface InteractionHistory {
  id: string;
  userId: string;
  userEmail: string;
  pergunta: string;
  resposta: string;
  timestamp: any;
  contexto: string;
}
