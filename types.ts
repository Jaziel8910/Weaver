export type Page = 'hub' | 'stories' | 'account' | 'changelog' | 'create-story' | 'story-viewer' | 'store';
export type Language = 'en' | 'es';

export interface User {
  name: string;
  email: string;
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
  chapters: Chapter[];
  universe: string;
  characters: Character[];
  plot: string;
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
    icon: React.ReactNode;
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