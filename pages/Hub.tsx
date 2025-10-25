import React, { useContext } from 'react';
import type { Story, Challenge } from '../types';
import { featuredStory, trendingStories, weeklyChallenge } from '../constants';
import { Award, TrendingUp, PenSquare, Users, ArrowRight } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../App';

interface HubProps {
    viewStory: (id: string) => void;
    createNew: () => void;
}

const Hub: React.FC<HubProps> = ({ viewStory, createNew }) => {
  const { user } = useContext(AppContext);
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
            {/* Featured Story */}
            <section>
                <h2 className="flex items-center text-2xl font-bold text-white mb-4">
                    <Award className="text-yellow-400 mr-3" size={28}/>
                    {t('featuredStory')}
                </h2>
                <div onClick={() => viewStory(featuredStory.id)} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group flex flex-col md:flex-row">
                    <img src={featuredStory.coverImageUrl} alt={featuredStory.title} className="w-full md:w-1/3 h-96 md:h-auto object-cover"/>
                    <div className="p-6 flex flex-col justify-center">
                        <h3 className="font-bold text-3xl text-white group-hover:text-primary-500 transition-colors">{featuredStory.title}</h3>
                        <p className="text-md text-gray-400 mt-1 mb-4">by {featuredStory.author}</p>
                        <p className="text-gray-300 line-clamp-3">{featuredStory.summary}</p>
                        <span className="text-primary-500 font-semibold mt-4 flex items-center">
                            {t('readMore')} <ArrowRight size={16} className="ml-2"/>
                        </span>
                    </div>
                </div>
            </section>
            
            {/* Community Forum */}
            <section>
                <h2 className="flex items-center text-2xl font-bold text-white mb-4">
                    <Users className="text-primary-500 mr-3" size={28}/>
                    {t('communityForum')}
                </h2>
                <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-400">{t('forumDescription')}</p>
                    <button className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg">
                        {t('goToForum')}
                    </button>
                </div>
            </section>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
            {/* Trending Now */}
            <section>
                <h2 className="flex items-center text-2xl font-bold text-white mb-4">
                    <TrendingUp className="text-green-400 mr-3" size={28}/>
                    {t('trending')}
                </h2>
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    {trendingStories.map((story, index) => (
                        <div key={story.id} onClick={() => viewStory(story.id)} className="flex items-center cursor-pointer group p-2 rounded-md hover:bg-gray-700">
                           <span className="text-xl font-bold text-gray-500 mr-4">{index + 1}</span>
                           <div>
                               <h4 className="font-semibold text-white group-hover:text-primary-500">{story.title}</h4>
                               <p className="text-sm text-gray-400">{story.author}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </section>

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
