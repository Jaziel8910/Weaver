

import React, { useState, useContext } from 'react';
import type { Story } from '../types';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../App';
import { Star, Eye, Gem, BookOpen, AlertTriangle, ShieldCheck, PlayCircle, Swords, MessageCircleWarning, BrainCircuit, Droplets, HeartCrack, Cigarette, Puzzle } from 'lucide-react';
import { contentRatingTags } from '../constants';

interface StoryDetailsProps {
    story: Story;
    readStory: () => void;
}

const ratingOrder = [
    'E / 3+', '7+', '10+', '12+', '13+', '16+', '18+', '18+ NSFW (Explícito)'
];

const getRatingCategory = (tag: string): string | null => {
    for (const category in contentRatingTags) {
        if ((contentRatingTags as any)[category].includes(tag)) {
            return category;
        }
    }
    return null;
};

const getWarningVisuals = (warning: string) => {
    const w = warning.toLowerCase();
    
    // Violence
    if (w.includes('violencia') || w.includes('abuso') || w.includes('tortura') || w.includes('guerra') || w.includes('mutilación')) {
        return { icon: <Swords size={20} />, color: 'text-red-400' };
    }
    // Language
    if (w.includes('lenguaje')) {
        return { icon: <MessageCircleWarning size={20} />, color: 'text-yellow-400' };
    }
    // Psychological
    if (w.includes('psicológico') || w.includes('terror') || w.includes('trauma') || w.includes('suicidio') || w.includes('crisis existencial')) {
        return { icon: <BrainCircuit size={20} />, color: 'text-purple-400' };
    }
    // Gore/Blood
    if (w.includes('sangre') || w.includes('gore')) {
        return { icon: <Droplets size={20} />, color: 'text-red-600' };
    }
    // Sexual/NSFW
    if (w.includes('sexual') || w.includes('sexo') || w.includes('desnudez') || w.includes('nsfw') || w.includes('violación')) {
        return { icon: <HeartCrack size={20} />, color: 'text-pink-400' };
    }
    // Substance Use
    if (w.includes('drogas') || w.includes('alcohol') || w.includes('fumar')) {
        return { icon: <Cigarette size={20} />, color: 'text-orange-400' };
    }
    
    return { icon: <Puzzle size={20} />, color: 'text-gray-400' };
};

const getHighestRating = (warnings: string[]): { category: string, color: string } => {
    let highestIndex = -1;
    let highestCategory = 'E / 3+';

    warnings.forEach(w => {
        const category = getRatingCategory(w);
        if (category) {
            const index = ratingOrder.indexOf(category);
            if (index > highestIndex) {
                highestIndex = index;
                highestCategory = category;
            }
        }
    });
    
    let color = 'bg-green-600';
    if (highestIndex >= 5) color = 'bg-red-600'; // 16+
    else if (highestIndex >= 2) color = 'bg-yellow-600'; // 10+

    return { category: highestCategory, color };
};


const StoryDetails: React.FC<StoryDetailsProps> = ({ story, readStory }) => {
    const { user } = useContext(AppContext);
    const { t } = useTranslation();

    const isUltra = user?.plan.tier === 'Ultra';
    const highestRating = getHighestRating(story.contentWarnings);

    const allTags = [
      ...(Array.isArray(story.tags?.themes) ? story.tags.themes : []),
      ...(Array.isArray(story.tags?.plotDevices) ? story.tags.plotDevices : []),
    ];

    return (
        <div className="h-full overflow-y-auto">
            <header className="relative h-64 md:h-80 w-full">
                <img 
                    src={story.bannerVideoUrl || story.coverImageUrl} 
                    alt={`${story.title} banner`} 
                    className="w-full h-full object-cover opacity-30" 
                />
                 {isUltra && story.bannerVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle size={64} className="text-white opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </header>

            <div className="p-4 sm:p-6 md:p-8 -mt-48 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="md:flex md:items-end md:space-x-8">
                        <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                            <img 
                                src={story.coverImageUrl} 
                                alt={`${story.title} cover`} 
                                className="w-full h-auto rounded-lg shadow-2xl aspect-[3/4] object-cover"
                            />
                        </div>
                        <div className="mt-6 md:mt-0">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white">{story.title}</h1>
                            <p className="text-lg text-gray-400 mt-2">{t('by')} <span className="font-semibold text-primary-400">{story.author}</span></p>
                            <div className="flex items-center space-x-6 mt-4 text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <Star className="text-yellow-400"/>
                                    <span>{story.rating.community.toFixed(1)} ({t('tier')})</span>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Eye className="text-cyan-400"/>
                                    <span>{story.stats.reads.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Gem className="text-green-400"/>
                                    <span>{story.stats.weBucksEarned.toLocaleString()}</span>
                                </div>
                            </div>
                            <button 
                                onClick={readStory}
                                className="mt-6 w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-10 rounded-lg text-lg flex items-center justify-center transition-transform duration-200 hover:scale-105"
                            >
                                <BookOpen size={22} className="mr-3"/>
                                {t('startReading')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold border-b-2 border-primary-500 pb-2 mb-4">{t('synopsis')}</h2>
                                <p className="text-gray-300 leading-relaxed">{story.summary}</p>
                            </section>
                            <section>
                                <h2 className="text-2xl font-bold border-b-2 border-primary-500 pb-2 mb-4">{t('chapters')}</h2>
                                <ul className="space-y-3">
                                    {story.chapters.map((chapter, index) => (
                                        <li key={index} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                                            <span className="text-gray-300">{chapter.title}</span>
                                            <span className="text-xs text-gray-500">2 days ago</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                        <div className="space-y-8">
                             <section>
                                <h2 className="text-2xl font-bold border-b-2 border-primary-500 pb-2 mb-4">{t('details')}</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-400">{t('genre')}:</span> <span className="font-semibold">{story.tags.genre}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">{t('targetAudience')}:</span> <span className="font-semibold">{story.tags.targetAudience}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">{t('universeName')}:</span> <span className="font-semibold">{story.universe}</span></div>
                                </div>
                            </section>
                             <section>
                                <h3 className="text-xl font-bold mb-3">{t('tags')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </section>
                            <section>
                                <h2 className="text-2xl font-bold border-b-2 border-primary-500 pb-2 mb-4">{t('contentRating')}</h2>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    {story.contentWarnings.length > 0 ? (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className={`flex-shrink-0 w-20 h-20 rounded-md flex items-center justify-center ${highestRating.color}`}>
                                                    <span className="text-white text-3xl font-bold">{highestRating.category}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-white text-lg">Detailed Descriptors</h3>
                                                    <p className="text-xs text-gray-500">{t('aiGeneratedNotice')}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                                                {story.contentWarnings.map(warning => {
                                                    const { icon, color } = getWarningVisuals(warning);
                                                    return (
                                                        <div key={warning} className="flex items-center text-sm">
                                                            <span className={`mr-2 ${color}`}>{icon}</span>
                                                            <span className="text-gray-300">{warning}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center text-green-400">
                                            <ShieldCheck size={48} className="mr-4"/>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">Everyone</h3>
                                                <p className="text-sm text-gray-400">This story is suitable for all audiences.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryDetails;