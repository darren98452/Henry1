import type { LucideProps } from 'lucide-react';
import type React from 'react';
// FIX: Import the `Settings` type so it is available within this module, then re-export it.
import type { Settings } from './hooks/useSettings';
export type { Settings };

export interface SrsData {
  lastReviewed: string; // ISO date string
  nextReview: string; // ISO date string
  interval: number; // in days
  easeFactor: number;
  repetition: number;
}

export interface Word {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  synonyms: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  srsData?: SrsData;
}

export interface UserProgress {
  wordsLearned: number;
  accuracy: number;
  rank: Rank;
}

export interface Rank {
  name: 'Copper' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  icon: React.FC<{ className?: string }>;
  minWords: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.FC<LucideProps>;
}

export interface QuizQuestion {
  word: string;
  definition: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface SwipeItem {
    word1: string;
    word2: string;
    areSynonyms: boolean;
}

export interface User {
  id: number;
  name: string;
  avatarUrl: string;
  wordsLearned: number;
  isCurrentUser?: boolean;
}

export interface PracticeSession {
  id: string;
  type: 'Quiz' | 'Synonym Swipe' | 'Word Scramble' | 'Spelling Bee' | 'Wordle';
  score: number;
  total: number;
  date: string; // ISO date string
}

export interface UserData {
  words: Word[];
  bookmarkedWords: string[];
  quizStats: {
    totalCorrect: number;
    totalAnswered: number;
  };
  settings: Settings;
  friendIds: number[];
  practiceHistory: PracticeSession[];
}
