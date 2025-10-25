import React, { useContext } from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';
import type { Story } from '../types';
import { useTranslation } from '../App';


interface StoriesProps {
  createNew: () => void;
}

const StoryCard: React.FC<{story: Story; onClick: () => void}> = ({ story, onClick }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-all duration-300 shadow-lg" onClick={onClick}>
        <img src={story.coverImageUrl} alt={story.title} className="w-full h-80 object-cover"/>
        <div className="p-4">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-primary-500">{story.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{story.author}</p>
        </div>
    </div>
)

const Stories: React.FC<StoriesProps> = ({ createNew }) => {
  const { stories, viewStory } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <div className="p-8 h-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">{t('storiesTitle')}</h1>
          <p className="text-gray-400 mt-2">{t('storiesSubtitle')}</p>
        </div>
        <button 
            onClick={createNew}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform duration-200 hover:scale-105"
        >
            <PlusCircle size={20} className="mr-2" />
            {t('createNewStory')}
        </button>
      </header>
      
      {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {stories.map(story => (
              <StoryCard key={story.id} story={story} onClick={() => viewStory(story.id)} />
            ))}
          </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-20">
            <BookOpen size={64} className="mb-4"/>
            <h2 className="text-xl font-semibold">{t('emptyLibraryTitle')}</h2>
            <p>{t('emptyLibrarySubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default Stories;
