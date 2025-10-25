import React, { useState, useCallback, useContext } from 'react';
import type { Story, Chapter, Character } from '../types';
import { generateStoryChapters, generateStoryCover, groundedSearch } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { ChevronRight, ChevronLeft, Sparkles, Wand2, Globe, Users, BookText, Paintbrush } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';
import { WE_TOKEN_COSTS } from '../constants';
import { useTranslation } from '../App';

const ttsVoices = [
    { name: 'Zephyr', description: 'Clear, Friendly' },
    { name: 'Kore', description: 'Warm, Narrative' },
    { name: 'Puck', description: 'Bright, Youthful' },
    { name: 'Charon', description: 'Deep, Serious' },
    { name: 'Fenrir', description: 'Gravelly, Mature' },
];

const CreateStory: React.FC = () => {
  const { addStory, consumeWeTokens } = useContext(AppContext);
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  // Step 1
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [targetAudience, setTargetAudience] = useState('Young Adult');
  const [themes, setThemes] = useState('');
  // Step 2 Worldbuilding
  const [universe, setUniverse] = useState('');
  const [isExistingUniverse, setIsExistingUniverse] = useState(false);
  const [universeInfo, setUniverseInfo] = useState('');
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [keyLocations, setKeyLocations] = useState('');
  const [factions, setFactions] = useState('');
  const [techMagicLevel, setTechMagicLevel] = useState('Medieval Fantasy');
  const [historicalContext, setHistoricalContext] = useState('');
  // Step 3
  const [characters, setCharacters] = useState<Character[]>([{ name: '', description: '', role: 'Protagonist', arc: 'The Hero\'s Journey', voice: 'Kore' }]);
  // Step 4 Plot & Narrative
  const [plot, setPlot] = useState('');
  const [openingHook, setOpeningHook] = useState('Action');
  const [pacingArc, setPacingArc] = useState('Standard');
  const [climaxStyle, setClimaxStyle] = useState('Explosive & Decisive');
  const [endingType, setEndingType] = useState('Resolved (Happy)');
  const [plotDevices, setPlotDevices] = useState('');
  // Step 5 Style
  const [pov, setPov] =useState('Third Person Limited');
  const [writingStyle, setWritingStyle] = useState('Descriptive');
  const [literaryInfluences, setLiteraryInfluences] = useState('');
  const [dialogueStyle, setDialogueStyle] = useState('Modern');
  const [coverArtStyle, setCoverArtStyle] = useState('Digital Painting');
  const [tone, setTone] = useState('Serious');

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: '', description: '', role: 'Supporting', arc: 'Flat', voice: 'Zephyr' }]);
  };

  const handleCharacterChange = (index: number, field: keyof Character, value: string) => {
    const newCharacters = [...characters];
    (newCharacters[index] as any)[field] = value;
    setCharacters(newCharacters);
  };
  
  const handleRemoveCharacter = (index: number) => {
      setCharacters(characters.filter((_, i) => i !== index));
  }

  const fetchUniverseInfo = useCallback(async () => {
      if(!universe) return;
      setIsFetchingInfo(true);
      const info = await groundedSearch(universe);
      setUniverseInfo(info);
      setIsFetchingInfo(false);
  }, [universe]);

  const handleGenerateStory = async () => {
    if (!consumeWeTokens(WE_TOKEN_COSTS.storyGeneration)) return;
    
    setIsGenerating(true);

    const fullPrompt = `
      # EPIC STORY GENERATION BRIEF

      ## CORE CONCEPT
      - **Title**: ${title}
      - **One-Sentence Summary**: ${summary}
      - **Genre**: ${genre}
      - **Target Audience**: ${targetAudience}
      - **Core Themes**: ${themes}

      ## WORLD-BUILDING
      - **Universe Name**: ${universe}
      - **Universe Type**: ${isExistingUniverse ? `Existing universe. Key Info: ${universeInfo}` : 'Original universe'}
      - **Key Locations**: ${keyLocations}
      - **Factions/Groups**: ${factions}
      - **Technology/Magic Level**: ${techMagicLevel}
      - **Historical Context**: ${historicalContext}
      
      ## CHARACTERS (DEEP DIVE)
      ${characters.map(c => `
      - **Name**: ${c.name}
        - **Role**: ${c.role}
        - **Core Description**: ${c.description}
        - **Character Arc**: ${c.arc}
        - **Appearance**: ${c.appearance || 'Not specified'}
        - **Motivation**: ${c.motivation || 'Not specified'}
        - **Flaws**: ${c.flaws || 'Not specified'}
        - **Relationships**: ${c.relationships || 'Not specified'}
      `).join('')}

      ## PLOT & NARRATIVE STRUCTURE
      - **Plot Outline**: ${plot}
      - **Opening Hook Style**: ${openingHook}
      - **Desired Pacing Arc**: ${pacingArc}
      - **Climax Style**: ${climaxStyle}
      - **Ending Type**: ${endingType}
      - **Key Plot Devices**: ${plotDevices}

      ## STYLISTIC CHOICES
      - **Point of View**: ${pov}
      - **Narrative Writing Style**: ${writingStyle}
      - **Literary Influences**: ${literaryInfluences}
      - **Dialogue Style**: ${dialogueStyle}
      - **Overall Tone**: ${tone}
      
      ## FINAL INSTRUCTIONS
      Based on ALL the detailed information above, write 3 long, high-quality, and enjoyable chapters. The story must be engaging and reflect all the specified parameters. Each chapter must have a clear title prefixed with "Chapter X:". Use "---" as a separator between chapters.
    `;

    const coverPrompt = `${title}: A ${genre} story about ${summary}. Style: ${coverArtStyle}, dramatic lighting.`;
    const [chaptersResponse, coverImageUrl] = await Promise.all([
      generateStoryChapters(fullPrompt),
      generateStoryCover(coverPrompt, "3:4"),
    ]);
    
    const parsedChapters: Chapter[] = chaptersResponse
        .split('---')
        .map(part => part.trim())
        .filter(part => part.startsWith('Chapter'))
        .map(part => {
            const lines = part.split('\n');
            const chapterTitle = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            return { title: chapterTitle, content };
        });

    const newStory: Story = {
      id: new Date().toISOString(),
      title,
      author: 'Gemini & You',
      summary,
      coverImageUrl,
      chapters: parsedChapters.length > 0 ? parsedChapters : [{title: "Chapter 1", content: chaptersResponse}],
      universe,
      characters,
      plot,
    };

    addStory(newStory);
    setIsGenerating(false);
  };
  
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStep = () => {
      switch(step) {
          case 1: // Core Concept
              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center text-2xl font-semibold text-white"><BookText className="mr-3 text-primary-500"/>{t('step1Title')}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('storyTitle')}</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('storyTitlePlaceholder')}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('summary')}</label>
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('summaryPlaceholder')}></textarea>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('genre')}</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                            <option>Fantasy</option><option>Sci-Fi</option><option>Horror</option><option>Romance</option><option>Thriller</option><option>Cyberpunk</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('targetAudience')}</label>
                        <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                            <option>Children</option><option>Young Adult</option><option>New Adult</option><option>Adult</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('themes')}</label>
                    <input type="text" value={themes} onChange={e => setThemes(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('themesPlaceholder')}/>
                  </div>
                </div>
              );
          case 2: // Worldbuilding
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center text-2xl font-semibold text-white"><Globe className="mr-3 text-primary-500"/>{t('step2Title')}</div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('universeName')}</label>
                          <input type="text" value={universe} onChange={e => setUniverse(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('universeNamePlaceholder')}/>
                      </div>
                      <div className="flex items-center">
                          <input type="checkbox" checked={isExistingUniverse} onChange={e => setIsExistingUniverse(e.target.checked)} id="existing-universe" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                          <label htmlFor="existing-universe" className="ml-2 block text-sm text-gray-300">{t('isExistingUniverse')}</label>
                      </div>
                      {isExistingUniverse && (
                          <div>
                              <button onClick={fetchUniverseInfo} disabled={isFetchingInfo} className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500">
                                  {isFetchingInfo ? <Spinner size={5}/> : <><Sparkles size={16} className="mr-2"/>{t('fetchUniverseInfo')}</>}
                              </button>
                              {universeInfo && <div className="mt-4 p-4 bg-gray-800 rounded-lg text-gray-300 text-sm whitespace-pre-wrap font-mono">{universeInfo}</div>}
                          </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('keyLocations')}</label>
                        <textarea value={keyLocations} onChange={e => setKeyLocations(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('keyLocationsPlaceholder')}></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('factions')}</label>
                        <textarea value={factions} onChange={e => setFactions(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('factionsPlaceholder')}></textarea>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('techMagicLevel')}</label>
                            <select value={techMagicLevel} onChange={e => setTechMagicLevel(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Prehistoric</option><option>Ancient</option><option>Medieval Fantasy</option><option>Industrial Revolution</option><option>Modern Day</option><option>Futuristic</option><option>Space Opera</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('historicalContext')}</label>
                            <input value={historicalContext} onChange={e => setHistoricalContext(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('historicalContextPlaceholder')}/>
                        </div>
                       </div>
                  </div>
              );
          case 3: // Characters
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center text-2xl font-semibold text-white"><Users className="mr-3 text-primary-500"/>{t('step3Title')}</div>
                      {characters.map((char, index) => (
                          <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 relative">
                              {characters.length > 1 && (
                                  <button onClick={() => handleRemoveCharacter(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterName')}</label>
                                      <input type="text" value={char.name} onChange={e => handleCharacterChange(index, 'name', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterRole')}</label>
                                      <select value={char.role} onChange={e => handleCharacterChange(index, 'role', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2">
                                          <option>Protagonist</option><option>Antagonist</option><option>Supporting</option><option>Love Interest</option><option>Mentor</option>
                                      </select>
                                  </div>
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterDescription')}</label>
                                      <input type="text" value={char.description} onChange={e => handleCharacterChange(index, 'description', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterDescriptionPlaceholder')}/>
                                  </div>
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterAppearance')}</label>
                                      <input type="text" value={char.appearance} onChange={e => handleCharacterChange(index, 'appearance', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterAppearancePlaceholder')} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterMotivation')}</label>
                                      <input type="text" value={char.motivation} onChange={e => handleCharacterChange(index, 'motivation', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterMotivationPlaceholder')} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterFlaws')}</label>
                                      <input type="text" value={char.flaws} onChange={e => handleCharacterChange(index, 'flaws', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterFlawsPlaceholder')}/>
                                  </div>
                                   <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterRelationships')}</label>
                                      <input type="text" value={char.relationships} onChange={e => handleCharacterChange(index, 'relationships', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2" placeholder={t('characterRelationshipsPlaceholder')} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('characterArc')}</label>
                                      <select value={char.arc} onChange={e => handleCharacterChange(index, 'arc', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2">
                                          <option>The Hero's Journey</option><option>Redemption Arc</option><option>Tragedy / The Fall</option><option>Coming of Age</option><option>Flat Arc (Stays the Same)</option>
                                      </select>
                                  </div>
                                   <div>
                                      <label className="block text-sm font-medium text-gray-300 mb-1">{t('dialogueVoice')}</label>
                                      <select value={char.voice} onChange={e => handleCharacterChange(index, 'voice', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2">
                                          {ttsVoices.map(voice => (
                                              <option key={voice.name} value={voice.name}>{voice.name} ({voice.description})</option>
                                          ))}
                                      </select>
                                  </div>
                              </div>
                          </div>
                      ))}
                      <button onClick={handleAddCharacter} className="text-primary-500 hover:text-primary-400 font-medium text-sm">{t('addCharacter')}</button>
                  </div>
              );
          case 4: // Plot
              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center text-2xl font-semibold text-white"><BookText className="mr-3 text-primary-500"/>{t('step4Title')}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('plotOutline')}</label>
                    <textarea value={plot} onChange={e => setPlot(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={8} placeholder={t('plotOutlinePlaceholder')}></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('openingHook')}</label>
                            <select value={openingHook} onChange={e => setOpeningHook(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Action</option><option>Mystery</option><option>World-building</option><option>Character introspection</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('pacingArc')}</label>
                            <select value={pacingArc} onChange={e => setPacingArc(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Standard (Rising Action)</option><option>Slow Burn</option><option>Constant Action</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('climaxStyle')}</label>
                            <select value={climaxStyle} onChange={e => setClimaxStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Explosive & Decisive</option><option>Emotional & Character-driven</option><option>Intellectual Twist</option><option>Pyrrhic Victory</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('endingType')}</label>
                            <select value={endingType} onChange={e => setEndingType(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Resolved (Happy)</option><option>Resolved (Sad/Bittersweet)</option><option>Ambiguous</option><option>Cliffhanger</option>
                            </select>
                        </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('plotDevices')}</label>
                    <input type="text" value={plotDevices} onChange={e => setPlotDevices(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('plotDevicesPlaceholder')}/>
                  </div>
                </div>
              );
            case 5: // Style
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center text-2xl font-semibold text-white"><Paintbrush className="mr-3 text-primary-500"/>{t('step5Title')}</div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('pov')}</label>
                                <select value={pov} onChange={e => setPov(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>First Person</option><option>Third Person Limited</option><option>Third Person Omniscient</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('writingStyle')}</label>
                                <select value={writingStyle} onChange={e => setWritingStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Descriptive & Poetic</option><option>Concise & Action-Oriented</option><option>Introspective & Philosophical</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('dialogueStyle')}</label>
                                <select value={dialogueStyle} onChange={e => setDialogueStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Modern & Realistic</option><option>Formal & Archaic</option><option>Witty & Banter-heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('tone')}</label>
                                <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Serious</option><option>Humorous</option><option>Dark & Gritty</option><option>Whimsical</option><option>Epic & Grandiose</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('literaryInfluences')}</label>
                                <input value={literaryInfluences} onChange={e => setLiteraryInfluences(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('literaryInfluencesPlaceholder')}/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t('coverArtStyle')}</label>
                                 <select value={coverArtStyle} onChange={e => setCoverArtStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Digital Painting</option><option>Anime/Manga</option><option>Minimalist Graphic Design</option><option>Vintage Sci-Fi</option><option>Classic Fantasy</option>
                                </select>
                            </div>
                        </div>

                        <button onClick={handleGenerateStory} className="w-full flex items-center justify-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700">
                            <Wand2 className="mr-3" />
                            {t('weaveMyStory', {cost: WE_TOKEN_COSTS.storyGeneration})}
                        </button>
                    </div>
                )
          default: return null;
      }
  }
  
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Spinner size={16} />
        <h2 className="text-3xl font-bold text-white mt-8">{t('generatingTitle')}</h2>
        <p className="text-gray-400 mt-2 max-w-md">{t('generatingSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-full">
      <h1 className="text-4xl font-bold text-white mb-2">{t('createTitle')}</h1>
      <p className="text-gray-400 mb-8">{t('createSubtitle')}</p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
        <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" style={{width: `${(step/5)*100}%`}}></div>
      </div>
      
      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      <div className="mt-10 flex justify-between">
        {step > 1 ? (
          <button onClick={prevStep} className="flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
            <ChevronLeft size={16} className="mr-2"/> {t('previous')}
          </button>
        ) : <div></div>}
        {step < 5 ? (
          <button onClick={nextStep} className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600">
            {t('next')} <ChevronRight size={16} className="ml-2"/>
          </button>
        ) : <div></div>}
      </div>
    </div>
  );
};

export default CreateStory;
