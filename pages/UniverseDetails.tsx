import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { Universe, Character } from '../types';
import { useTranslation } from '../App';
import { Globe, BookText, Zap, Sparkles, BookCopy, UserPlus, Image, Save } from 'lucide-react';
import Spinner from '../components/Spinner';
import { generateUniverseDetails, fetchFranchiseLore, generateCrossoverChapter, generateCrossoverArt, generateCharacterConceptArt } from '../services/geminiService';
import { WE_TOKEN_COSTS } from '../constants';

const ttsVoices = [
    { name: 'Zephyr', description: 'Clear, Friendly' },
    { name: 'Kore', description: 'Warm, Narrative' },
    { name: 'Puck', description: 'Bright, Youthful' },
    { name: 'Charon', description: 'Deep, Serious' },
    { name: 'Fenrir', description: 'Gravelly, Mature' },
];

const CharacterEditor: React.FC<{
    character: Character;
    onUpdate: (field: keyof Character, value: string) => void;
    onGenerateArt: () => void;
    isGeneratingArt: boolean;
    t: (key: any, params?: any) => string;
}> = ({ character, onUpdate, onGenerateArt, isGeneratingArt, t }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterName')}</label>
                <input type="text" value={character.name} onChange={e => onUpdate('name', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterRole')}</label>
                <select value={character.role} onChange={e => onUpdate('role', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2">
                    <option>Protagonist</option><option>Antagonist</option><option>Supporting</option><option>Love Interest</option><option>Mentor</option>
                </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterDescription')}</label>
                <input type="text" value={character.description} onChange={e => onUpdate('description', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterDescriptionPlaceholder')}/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterAppearance')}</label>
                <textarea value={character.appearance} onChange={e => onUpdate('appearance', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" rows={2} placeholder={t('characterAppearancePlaceholder')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterMotivation')}</label>
                <input type="text" value={character.motivation} onChange={e => onUpdate('motivation', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterMotivationPlaceholder')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterFlaws')}</label>
                <input type="text" value={character.flaws} onChange={e => onUpdate('flaws', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterFlawsPlaceholder')}/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterRelationships')}</label>
                <input type="text" value={character.relationships} onChange={e => onUpdate('relationships', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterRelationshipsPlaceholder')} />
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('conceptArt')}</h4>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                {character.conceptArtUrl ? (
                    <img src={character.conceptArtUrl} alt={`Concept art for ${character.name}`} className="max-h-full max-w-full object-contain rounded-lg"/>
                ) : (
                    <p className="text-gray-500">No art generated</p>
                )}
            </div>
            <button onClick={onGenerateArt} disabled={isGeneratingArt} className="mt-3 w-full flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500">
                {isGeneratingArt ? <Spinner size={5}/> : <><Image size={16} className="mr-2"/>{t('generateArt')} (-{WE_TOKEN_COSTS.characterConceptArt} WT)</>}
            </button>
        </div>
    </div>
);


const UniverseDetails: React.FC<{ universe: Universe }> = ({ universe }) => {
    const { stories, updateUniverse, consumeWeTokens, user } = useContext(AppContext);
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'canon' | 'notebook' | 'crossover'>('canon');
    
    // Canon state
    const [isGenerating, setIsGenerating] = useState(false);
    const [rules, setRules] = useState(universe.rules.join('\n'));

    // Notebook state
    const [canonicalCharacters, setCanonicalCharacters] = useState<Character[]>(() => JSON.parse(JSON.stringify(universe.characters)));
    const [artGenerationStates, setArtGenerationStates] = useState<boolean[]>(Array(universe.characters.length).fill(false));
    
    // Crossover State
    const [franchise, setFranchise] = useState('');
    const [lore, setLore] = useState('');
    const [isFetchingLore, setIsFetchingLore] = useState(false);
    const [selectedCharacterName, setSelectedCharacterName] = useState('');
    const [crossoverScenario, setCrossoverScenario] = useState('');
    const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);
    const [isGeneratingArt, setIsGeneratingArt] = useState(false);
    const [generatedArt, setGeneratedArt] = useState('');
    const [generatedChapter, setGeneratedChapter] = useState('');

    const universeStories = stories.filter(s => universe.storyIds.includes(s.id));

    useEffect(() => {
        if (selectedCharacterName === '' && canonicalCharacters.length > 0) {
            setSelectedCharacterName(canonicalCharacters[0].name);
        }
    }, [canonicalCharacters, selectedCharacterName]);
    
    const handleCrystallize = async () => {
        if (!consumeWeTokens(WE_TOKEN_COSTS.universeCrystallize)) return;
        setIsGenerating(true);
        const { description, timeline } = await generateUniverseDetails(universeStories);
        updateUniverse({ ...universe, description, timeline });
        setIsGenerating(false);
    };

    const handleSaveRules = () => {
        const updatedRules = rules.split('\n').filter(r => r.trim() !== '');
        updateUniverse({ ...universe, rules: updatedRules });
        alert('Rules saved!');
    };

    const handleFetchLore = async () => {
        if (!franchise || !consumeWeTokens(WE_TOKEN_COSTS.crossoverLore)) return;
        setIsFetchingLore(true);
        const fetchedLore = await fetchFranchiseLore(franchise);
        setLore(fetchedLore);
        setIsFetchingLore(false);
    };
    
    const handleGenerateCrossoverChapter = async () => {
        const character = canonicalCharacters.find(c => c.name === selectedCharacterName);
        if (!character || !lore || !crossoverScenario || !consumeWeTokens(WE_TOKEN_COSTS.crossoverChapter)) return;
        setIsGeneratingChapter(true);
        setGeneratedChapter('');
        const chapter = await generateCrossoverChapter(character, lore, crossoverScenario);
        setGeneratedChapter(chapter);
        setIsGeneratingChapter(false);
    };
    
    const handleGenerateCrossoverArt = async () => {
        const character = canonicalCharacters.find(c => c.name === selectedCharacterName);
        if (!character || !lore || !consumeWeTokens(WE_TOKEN_COSTS.crossoverArt)) return;
        setIsGeneratingArt(true);
        setGeneratedArt('');
        const art = await generateCrossoverArt(character, lore);
        setGeneratedArt(art);
        setIsGeneratingArt(false);
    };

    // Notebook handlers
    const handleAddCharacter = () => {
        const newCharacter: Character = { name: 'New Character', description: '', role: 'Supporting', arc: 'Flat' };
        setCanonicalCharacters(prev => [...prev, newCharacter]);
        setArtGenerationStates(prev => [...prev, false]);
    };

    const handleUpdateCharacter = (index: number, field: keyof Character, value: string) => {
        const newChars = [...canonicalCharacters];
        (newChars[index] as any)[field] = value;
        setCanonicalCharacters(newChars);
    };
    
    const handleGenerateConceptArt = async (index: number) => {
        if (!consumeWeTokens(WE_TOKEN_COSTS.characterConceptArt)) return;
        
        setArtGenerationStates(states => states.map((s, i) => i === index ? true : s));
        const artUrl = await generateCharacterConceptArt(canonicalCharacters[index]);
        handleUpdateCharacter(index, 'conceptArtUrl', artUrl);
        setArtGenerationStates(states => states.map((s, i) => i === index ? false : s));
    };

    const handleSaveChanges = () => {
        updateUniverse({ ...universe, characters: canonicalCharacters });
        alert('Notebook saved successfully!');
    };


    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <div className="flex items-center">
                    <Globe className="text-primary-500 mr-4" size={40}/>
                    <div>
                        <h1 className="text-4xl font-bold text-white">{universe.name}</h1>
                        <p className="text-gray-400 mt-1">{universe.description}</p>
                    </div>
                </div>
            </header>

            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('canon')} className={`${activeTab === 'canon' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-white'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                       <BookText size={20} className="mr-2"/> {t('canon')}
                    </button>
                    <button onClick={() => setActiveTab('notebook')} className={`${activeTab === 'notebook' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-white'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                       <BookCopy size={20} className="mr-2"/> {t('notebook')}
                    </button>
                    <button onClick={() => setActiveTab('crossover')} disabled={user?.plan.tier !== 'Ultra'} className={`${activeTab === 'crossover' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-white'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed`}>
                       <Sparkles size={20} className="mr-2"/> {t('crossover')}
                    </button>
                </nav>
            </div>

            {activeTab === 'canon' && (
                <div className="animate-fade-in space-y-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('crystallize')}</h2>
                        <p className="text-gray-400 mb-4">{t('crystallizeDescription')}</p>
                        <button onClick={handleCrystallize} disabled={isGenerating} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500">
                            {isGenerating ? <Spinner size={5}/> : <><Zap size={16} className="mr-2"/>{t('generateTimeline')}</>}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-xl font-semibold text-white mb-4">{t('rules')}</h3>
                             <textarea value={rules} onChange={e => setRules(e.target.value)} className="w-full h-48 bg-gray-800/50 border border-gray-700 rounded-lg p-3 font-mono text-sm" placeholder={t('rulesPlaceholder')}></textarea>
                             <button onClick={handleSaveRules} className="mt-3 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Save Rules</button>
                        </div>
                         <div>
                             <h3 className="text-xl font-semibold text-white mb-4">{t('timeline')}</h3>
                             <div className="prose prose-invert max-w-none p-4 bg-gray-800/50 rounded-lg border border-gray-700 h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: universe.timeline.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'notebook' && (
                 <div className="animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                         <h2 className="text-2xl font-bold text-white">{t('canonicalCharacters')}</h2>
                         <div className="flex gap-4">
                            <button onClick={handleAddCharacter} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                <UserPlus size={16} className="mr-2"/> {t('addCharacter')}
                            </button>
                             <button onClick={handleSaveChanges} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600">
                                <Save size={16} className="mr-2"/> {t('saveChanges')}
                            </button>
                         </div>
                    </div>
                    <div className="space-y-6">
                        {canonicalCharacters.map((char, index) => (
                            <CharacterEditor 
                                key={index} 
                                character={char}
                                onUpdate={(field, value) => handleUpdateCharacter(index, field, value)}
                                onGenerateArt={() => handleGenerateConceptArt(index)}
                                isGeneratingArt={artGenerationStates[index]}
                                t={t}
                            />
                        ))}
                    </div>
                 </div>
            )}
            
            {activeTab === 'crossover' && user?.plan.tier === 'Ultra' && (
                 <div className="animate-fade-in bg-gray-800 p-6 rounded-lg border-2 border-purple-500/50">
                     <h2 className="text-2xl font-bold text-white mb-3">{t('crossover')}</h2>
                     <p className="text-gray-400 mb-6">{t('crossoverDescription')}</p>
                     
                     <div className="space-y-6">
                        {/* Step 1: Fetch Lore */}
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">{t('franchise')}</label>
                             <div className="flex gap-2">
                                <input type="text" value={franchise} onChange={e => setFranchise(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-2" />
                                <button onClick={handleFetchLore} disabled={isFetchingLore || !franchise} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500">
                                    {isFetchingLore ? <Spinner size={5}/> : t('fetchLore')}
                                </button>
                             </div>
                             {lore && <div className="mt-4 p-4 bg-gray-900 rounded-lg text-gray-300 text-sm whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">{lore}</div>}
                        </div>
                        {/* Step 2: Generate Chapter */}
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('infiltrate')}</label>
                                    <select value={selectedCharacterName} onChange={e => setSelectedCharacterName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2">
                                        {canonicalCharacters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                 <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-gray-300 mb-1">{t('scenario')}</label>
                                     <input type="text" value={crossoverScenario} onChange={e => setCrossoverScenario(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2" placeholder={t('scenarioPlaceholder')} />
                                 </div>
                            </div>
                             <button onClick={handleGenerateCrossoverChapter} disabled={isGeneratingChapter || !lore || !crossoverScenario} className="mt-3 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500">
                                {isGeneratingChapter ? <Spinner size={6} /> : `${t('generateCrossoverChapter')} (-${WE_TOKEN_COSTS.crossoverChapter} WT)`}
                             </button>
                             {generatedChapter && <div className="mt-4 p-4 bg-gray-900 rounded-lg text-gray-300 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">{generatedChapter}</div>}
                        </div>
                        {/* Step 3: Concept Art */}
                        <div>
                             <button onClick={handleGenerateCrossoverArt} disabled={isGeneratingArt || !lore} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500">
                                {isGeneratingArt ? <Spinner size={6} /> : `${t('generateCrossoverArt')} (-${WE_TOKEN_COSTS.crossoverArt} WT)`}
                             </button>
                             {generatedArt && <img src={generatedArt} alt="Crossover Concept Art" className="mt-4 rounded-lg w-full object-contain" />}
                        </div>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default UniverseDetails;