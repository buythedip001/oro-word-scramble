export interface WordData {
  word: string;
  hint: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Letter {
  id: string;
  char: string;
}

export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

export interface GameStats {
  score: number;
  streak: number;
  wordsSolved: number;
}