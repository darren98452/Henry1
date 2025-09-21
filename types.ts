import type { LucideProps } from 'lucide-react';
import type React from 'react';

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