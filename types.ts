// FIX: Import `ReactNode` to resolve the "Cannot find namespace 'React'" error.
import type { ReactNode } from 'react';

export type Page = 'hub' | 'stories' | 'account' | 'changelog' | 'create-story' | 'story-viewer' | 'store' | 'story-details' | 'guide' | 'universes' | 'universe-details' | 'chat';
export type Language = 'en' | 'es';

export interface User {
  name: string;
  email: string;
  isGuest?: boolean;
  password?: string; // Only used for simulation, DO NOT use in production
  securityQuestion?: string;
  securityAnswer?: string;
  avatarUrl: string;
  weBucks: number;
  weTokens: number;
  lastWeTokenRefresh: number; // Timestamp
  plan: {
    tier: 'Free' | 'Pro' | 'Ultra';
    expires?: number; // Timestamp
  };
  inventory: {
    themes: string[];
    features: string[];
  }
}

export interface Chapter {
  title: string;
  content: string;
  history?: { timestamp: number; content: string }[];
  // "What If?" feature fields
  isAlternative?: boolean;
  basedOnChapterIndex?: number; // The index of the chapter it diverged from
  userPrompt?: string; // The prompt that generated it
}

export interface Character {
  name: string;
  description: string;
  role: string;
  arc: string;
  voice?: string;
  // Deep dive fields
  appearance?: string;
  motivation?: string;
  flaws?: string;
  relationships?: string; // e.g., "Rivals with Kael, Mentored by Jax"
  conceptArtUrl?: string; // For the Notebook
}

export interface DialogueLine {
  character: string;
  line: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  summary: string;
  coverImageUrl: string;
  bannerVideoUrl?: string; // For ULTRA plan
  chapters: Chapter[];
  universe: string;
  characters: Character[];
  plot: string;
  tags: {
    genre: string;
    targetAudience: string;

    themes: string[];
    plotDevices: string[];
  };
  rating: {
    ai: number; 
    community: number;
  };
  stats: {
    reads: number;
    weBucksEarned: number;
  };
  contentWarnings: string[];
}

export interface Universe {
  id: string;
  name: string;
  description: string; // Gemini-generated summary of the universe
  rules: string[]; // User-defined canon rules
  timeline: string; // Gemini-generated markdown timeline
  storyIds: string[];
  characters: Character[]; // Canonical characters for the universe bible/notebook
}


export interface ChangelogItem {
  version: string;
  date: string;
  changes: string[];
}

export interface Challenge {
  title:string;
  prompt: string;
  endDate: string;
}

export interface Plan {
    name: 'Free' | 'Pro' | 'Ultra';
    // FIX: Use the imported `ReactNode` type directly instead of `React.ReactNode`.
    icon: ReactNode;
    benefits: string[];
    price?: {
        weBucks: number;
        durationDays: number; // Base duration
    };
    weTokenAllowance: number;
    weTokenRefreshDays: number;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward: number;
    isCompleted: (user: User, stories: Story[]) => boolean;
}


export interface ChatbotMessage {
  sender: 'user' | 'ai' | 'character';
  content: string;
  characterName?: string;
}