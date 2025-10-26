import { createContext } from 'react';
import type { User, Story, Universe } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  stories: Story[];
  addStory: (newStory: Story) => void;
  viewStory: (storyId: string) => void;
  updateStory: (updatedStory: Story) => void;
  consumeWeTokens: (amount: number) => boolean;
  universes: Universe[];
  addUniverse: (newUniverse: Universe) => void;
  updateUniverse: (updatedUniverse: Universe) => void;
  viewUniverse: (universeId: string) => void;
  startStoryInUniverse: (universeId: string) => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  stories: [],
  addStory: () => {},
  viewStory: () => {},
  updateStory: () => {},
  consumeWeTokens: () => false,
  universes: [],
  addUniverse: () => {},
  updateUniverse: () => {},
  viewUniverse: () => {},
  startStoryInUniverse: () => {},
});