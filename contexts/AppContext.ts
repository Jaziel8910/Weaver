import { createContext } from 'react';
import type { User, Story } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  stories: Story[];
  addStory: (newStory: Story) => void;
  viewStory: (storyId: string) => void;
  updateStory: (updatedStory: Story) => void;
  consumeWeTokens: (amount: number) => boolean;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  stories: [],
  addStory: () => {},
  viewStory: () => {},
  updateStory: () => {},
  consumeWeTokens: () => false,
});
