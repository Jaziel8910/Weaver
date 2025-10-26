import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../App';
import { PenSquare, PlusCircle } from 'lucide-react';
import { weeklyChallenge } from '../constants';
import type { Story } from '../types';

const StoryCard: React.FC<{story: Story; onClick: () => void}> = ({ story, onClick }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group transform hover:-translate-y-1 transition-all duration-300 shadow-lg" onClick={onClick}>
        <img src={story.coverImageUrl} alt={story.title} className="w-full h-80 object-cover"/>
        <div className="p-4">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-primary-500">{story.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{story.author}</p>
        </div>
    </div>
)

const Hub: React.FC<{ viewStory: (id: string) => void; createNew: () => void; }> = ({ viewStory, createNew }) => {
  const { user, stories } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">{t('welcome')} {user?.name}</h1>
        <p className="text-gray-400 mt-2">{t('hubSubtitle')}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                        {t('myStories')}
                    </h2>
                     <button 
                        onClick={createNew}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform duration-200 hover:scale-105"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        {t('createNewStory')}
                    </button>
                </div>
                 {stories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.slice(0, 6).map(story => (
                          <StoryCard key={story.id} story={story} onClick={() => viewStory(story.id)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">{t('emptyLibraryTitle')}</p>
                        <p className="text-gray-500 text-sm">{t('emptyLibrarySubtitle')}</p>
                    </div>
                )}
            </section>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
            {/* Weekly Challenge */}
            <section>
                <h2 className="flex items-center text-2xl font-bold text-white mb-4">
                    <PenSquare className="text-blue-400 mr-3" size={28}/>
                    {t('weeklyChallenge')}
                </h2>
                <div className="bg-gray-800 rounded-lg p-6 border-2 border-dashed border-blue-400/50">
                    <h3 className="font-bold text-lg text-blue-300">{weeklyChallenge.title}</h3>
                    <p className="text-gray-300 mt-2 text-sm">{weeklyChallenge.prompt}</p>
                    <div className="flex justify-between items-center mt-4">
                         <button onClick={createNew} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm">
                            {t('acceptChallenge')}
                        </button>
                        <span className="text-xs text-gray-500 font-mono">{t('endsIn')} {weeklyChallenge.endDate}</span>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default Hub;
