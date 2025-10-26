import React, { useState, useCallback, useContext, useMemo, useEffect } from 'react';
import type { Story, Chapter, Character } from '../types';
import { generateStoryChapters, generateStoryCover, analyzeStoryContent } from '../services/geminiService';
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

interface CreateStoryProps {
  initialUniverseId?: string | null;
  onCreationStarted: () => void;
}

const CreateStory: React.FC<CreateStoryProps> = ({ initialUniverseId, onCreationStarted }) => {
  const { addStory, consumeWeTokens, universes } = useContext(AppContext);
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  // Step 1
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [targetAudience, setTargetAudience] = useState('Young Adult');
  const [themes, setThemes] = useState('');
  // Step 2 Worldbuilding
  const [universeSelectionMode, setUniverseSelectionMode] = useState<'new' | 'existing'>('new');
  const [selectedUniverseId, setSelectedUniverseId] = useState<string>('');
  const [newUniverseName, setNewUniverseName] = useState('');
  const [keyLocations, setKeyLocations] = useState('');
  const [factions, setFactions] = useState('');
  const [techMagicLevel, setTechMagicLevel] = useState('Medieval Fantasy');
  const [historicalContext, setHistoricalContext] = useState('');
  // Step 3
  const [characters, setCharacters] = useState<Character[]>([{ name: '', description: '', role: 'Protagonist', arc: 'The Hero\'s Journey', voice: 'Kore' }]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportChars, setSelectedImportChars] = useState<string[]>([]);
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

  useEffect(() => {
    if (initialUniverseId) {
      const universeExists = universes.some(u => u.id === initialUniverseId);
      if (universeExists) {
        setUniverseSelectionMode('existing');
        setSelectedUniverseId(initialUniverseId);
      }
      onCreationStarted(); // Clear the state in App.tsx
    }
  }, [initialUniverseId, onCreationStarted, universes]);
  
  const universeNameForStory = useMemo(() => {
    if (universeSelectionMode === 'new') {
      return newUniverseName;
    }
    const selected = universes.find(u => u.id === selectedUniverseId);
    return selected ? selected.name : '';
  }, [universeSelectionMode, selectedUniverseId, newUniverseName, universes]);

  const selectedUniverseForImport = useMemo(() => {
    return universes.find(u => u.id === selectedUniverseId);
  }, [selectedUniverseId, universes]);

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
  
  const handleToggleImportChar = (charName: string) => {
    setSelectedImportChars(prev => 
      prev.includes(charName) 
        ? prev.filter(name => name !== charName)
        : [...prev, charName]
    );
  };
  
  const handleConfirmImport = () => {
    if (!selectedUniverseForImport) return;

    const charsToImport = selectedUniverseForImport.characters.filter(char => selectedImportChars.includes(char.name));
    
    // Filter out characters that are already in the list by name
    const existingCharNames = characters.map(c => c.name);
    const newChars = charsToImport.filter(c => !existingCharNames.includes(c.name));
    
    // Deep copy to prevent modifying the canonical character in the universe
    const newCharsToAdd = JSON.parse(JSON.stringify(newChars));

    setCharacters(prev => {
        const isFirstCharEmpty = prev.length === 1 && !prev[0].name && !prev[0].description;
        if (isFirstCharEmpty) {
            return newCharsToAdd.length > 0 ? newCharsToAdd : prev;
        }
        return [...prev, ...newCharsToAdd];
    });
    setIsImportModalOpen(false);
    setSelectedImportChars([]);
  };

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
      - **Universe Name**: ${universeNameForStory}
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

    const finalChapters = parsedChapters.length > 0 ? parsedChapters : [{title: "Chapter 1", content: chaptersResponse}];
    const contentForAnalysis = finalChapters.map(c => c.content).join('\n\n');
    const contentWarnings = await analyzeStoryContent(contentForAnalysis);
    
    const newStory: Story = {
      id: new Date().toISOString(),
      title,
      author: 'Gemini & You',
      summary,
      coverImageUrl,
      chapters: finalChapters,
      universe: universeNameForStory,
      characters,
      plot,
      tags: {
        genre: genre,
        targetAudience: targetAudience,
        themes: themes.split(',').map(t => t.trim()).filter(Boolean),
        plotDevices: plotDevices.split(',').map(t => t.trim()).filter(Boolean),
      },
      rating: {
        ai: parseFloat((Math.random() * (4.8 - 3.5) + 3.5).toFixed(1)),
        community: 0,
      },
      stats: {
        reads: 0,
        weBucksEarned: 0,
      },
      contentWarnings: contentWarnings,
    };

    addStory(newStory);
    setIsGenerating(false);
  };
  
  const handleQuickGenerateStory = async () => {
    if (!title || !summary) {
        alert("Please provide a title and summary for your story.");
        return;
    }
    if (!consumeWeTokens(WE_TOKEN_COSTS.storyGeneration)) return;

    setIsGenerating(true);

    const quickPrompt = `
      # QUICK STORY GENERATION BRIEF
      You are an expert storyteller.

      ## CORE CONCEPT
      - **Title**: ${title}
      - **One-Sentence Summary**: ${summary}
      - **Genre**: ${genre}
      - **Target Audience**: ${targetAudience}
      - **Core Themes**: ${themes}

      ## INSTRUCTIONS
      Based on the core concept above, flesh out a compelling story. Invent interesting characters, a simple plot, and a suitable world. Write 3 engaging, high-quality chapters. Each chapter must have a clear title prefixed with "Chapter X:". Use "---" as a separator between chapters.
    `;

    const coverPrompt = `${title}: A ${genre} story about ${summary}. Style: ${coverArtStyle}, dramatic lighting.`;
    
    const [chaptersResponse, coverImageUrl] = await Promise.all([
      generateStoryChapters(quickPrompt),
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

    const finalChapters = parsedChapters.length > 0 ? parsedChapters : [{title: "Chapter 1", content: chaptersResponse}];
    const contentForAnalysis = finalChapters.map(c => c.content).join('\n\n');
    const contentWarnings = await analyzeStoryContent(contentForAnalysis);
    
    const newStory: Story = {
      id: new Date().toISOString(),
      title,
      author: 'Gemini & You',
      summary,
      coverImageUrl,
      chapters: finalChapters,
      universe: 'Generated by AI',
      characters: [{ name: 'Main Character', description: 'Generated by AI', role: 'Protagonist', arc: 'The Hero\'s Journey' }],
      plot: 'Generated by AI based on summary.',
      tags: {
        genre: genre,
        targetAudience: targetAudience,
        themes: themes.split(',').map(t => t.trim()).filter(Boolean),
        plotDevices: [],
      },
      rating: {
        ai: parseFloat((Math.random() * (4.8 - 3.5) + 3.5).toFixed(1)),
        community: 0,
      },
      stats: {
        reads: 0,
        weBucksEarned: 0,
      },
      contentWarnings: contentWarnings,
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('storyTitle')}</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('storyTitlePlaceholder')}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('summary')}</label>
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('summaryPlaceholder')}></textarea>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('genre')}</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                            <option>Fantasy</option><option>Sci-Fi</option><option>Horror</option><option>Romance</option><option>Thriller</option><option>Cyberpunk</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('targetAudience')}</label>
                        <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                            <option>Children</option><option>Young Adult</option><option>New Adult</option><option>Adult</option>
                        </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('themes')}</label>
                    <input type="text" value={themes} onChange={e => setThemes(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('themesPlaceholder')}/>
                  </div>
                </div>
              );
          case 2: // Worldbuilding
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center text-2xl font-semibold text-white"><Globe className="mr-3 text-primary-500"/>{t('step2Title')}</div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input type="radio" name="universe-mode" value="new" checked={universeSelectionMode === 'new'} onChange={() => setUniverseSelectionMode('new')} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                <span className="ml-2 text-gray-200">{t('createNewUniverse')}</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="universe-mode" value="existing" checked={universeSelectionMode === 'existing'} onChange={() => setUniverseSelectionMode('existing')} disabled={universes.length === 0} className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 disabled:opacity-50" />
                                <span className={`ml-2 ${universes.length === 0 ? 'text-gray-500' : 'text-gray-200'}`}>{t('useExistingUniverse')}</span>
                            </label>
                        </div>
                      </div>

                      {universeSelectionMode === 'new' ? (
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{t('universeName')}</label>
                              <input type="text" value={newUniverseName} onChange={e => setNewUniverseName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('universeNamePlaceholder')}/>
                          </div>
                      ) : (
                          <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">{t('selectUniverse')}</label>
                              <select value={selectedUniverseId} onChange={e => setSelectedUniverseId(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                  <option value="" disabled>{t('selectAUniversePrompt')}</option>
                                  {universes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                              </select>
                          </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('keyLocations')}</label>
                        <textarea value={keyLocations} onChange={e => setKeyLocations(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('keyLocationsPlaceholder')}></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('factions')}</label>
                        <textarea value={factions} onChange={e => setFactions(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={2} placeholder={t('factionsPlaceholder')}></textarea>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('techMagicLevel')}</label>
                            <select value={techMagicLevel} onChange={e => setTechMagicLevel(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Prehistoric</option><option>Ancient</option><option>Medieval Fantasy</option><option>Industrial Revolution</option><option>Modern Day</option><option>Futuristic</option><option>Space Opera</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('historicalContext')}</label>
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
                      <div className="flex items-center gap-4">
                        <button onClick={() => setIsImportModalOpen(true)} disabled={universeSelectionMode === 'new' || !selectedUniverseForImport || selectedUniverseForImport.characters.length === 0} className="text-primary-500 hover:text-primary-400 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                          {t('importCharacter')}
                        </button>
                        <button onClick={handleAddCharacter} className="text-primary-500 hover:text-primary-400 font-medium text-sm">{t('addCharacter')}</button>
                      </div>
                  </div>
              );
          case 4: // Plot
              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center text-2xl font-semibold text-white"><BookText className="mr-3 text-primary-500"/>{t('step4Title')}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('plotOutline')}</label>
                    <textarea value={plot} onChange={e => setPlot(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" rows={8} placeholder={t('plotOutlinePlaceholder')}></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('openingHook')}</label>
                            <select value={openingHook} onChange={e => setOpeningHook(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Action</option><option>Mystery</option><option>World-building</option><option>Character introspection</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('pacingArc')}</label>
                            <select value={pacingArc} onChange={e => setPacingArc(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Standard (Rising Action)</option><option>Slow Burn</option><option>Constant Action</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('climaxStyle')}</label>
                            <select value={climaxStyle} onChange={e => setClimaxStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Explosive & Decisive</option><option>Emotional & Character-driven</option><option>Intellectual Twist</option><option>Pyrrhic Victory</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('endingType')}</label>
                            <select value={endingType} onChange={e => setEndingType(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                <option>Resolved (Happy)</option><option>Resolved (Sad/Bittersweet)</option><option>Ambiguous</option><option>Cliffhanger</option>
                            </select>
                        </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('plotDevices')}</label>
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
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('pov')}</label>
                                <select value={pov} onChange={e => setPov(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>First Person</option><option>Third Person Limited</option><option>Third Person Omniscient</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('writingStyle')}</label>
                                <select value={writingStyle} onChange={e => setWritingStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Descriptive & Poetic</option><option>Concise & Action-Oriented</option><option>Introspective & Philosophical</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('dialogueStyle')}</label>
                                <select value={dialogueStyle} onChange={e => setDialogueStyle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Modern & Realistic</option><option>Formal & Archaic</option><option>Witty & Banter-heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('tone')}</label>
                                <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    <option>Serious</option><option>Humorous</option><option>Dark & Gritty</option><option>Whimsical</option><option>Epic & Grandiose</option>
                                </select>
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('literaryInfluences')}</label>
                                <input value={literaryInfluences} onChange={e => setLiteraryInfluences(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2" placeholder={t('literaryInfluencesPlaceholder')}/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('coverArtStyle')}</label>
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
      {isImportModalOpen && selectedUniverseForImport && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <h2 className="text-2xl font-bold p-6 border-b border-gray-700">{t('importCharactersFrom', { universeName: selectedUniverseForImport.name })}</h2>
                  <div className="p-6 overflow-y-auto space-y-3">
                      {selectedUniverseForImport.characters.length > 0 ? (
                          selectedUniverseForImport.characters.map(char => (
                              <label key={char.name} className="flex items-start p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                  <input 
                                      type="checkbox"
                                      className="h-5 w-5 rounded border-gray-500 text-primary-600 bg-gray-900 focus:ring-primary-500 mt-1"
                                      checked={selectedImportChars.includes(char.name)}
                                      onChange={() => handleToggleImportChar(char.name)}
                                  />
                                  <div className="ml-4">
                                      <p className="font-semibold text-white">{char.name} <span className="text-sm font-normal text-gray-400">- {char.role}</span></p>
                                      <p className="text-sm text-gray-300">{char.description}</p>
                                  </div>
                              </label>
                          ))
                      ) : (
                          <p className="text-gray-400 text-center py-8">{t('noCanonicalCharacters')}</p>
                      )}
                  </div>
                  <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                      <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">{t('cancel')}</button>
                      <button onClick={handleConfirmImport} disabled={selectedImportChars.length === 0} className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
                          {t('importNCharacters', { count: selectedImportChars.length })}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <h1 className="text-4xl font-bold text-white mb-2">{t('createTitle')}</h1>
      <p className="text-gray-400 mb-8">{t('createSubtitle')}</p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
        <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" style={{width: `${(step/5)*100}%`}}></div>
      </div>
      
      <div className="min-h-[440px]">
        {renderStep()}
      </div>

      <div className="mt-8 flex justify-between items-center">
        {step > 1 ? (
          <button onClick={prevStep} className="flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600">
            <ChevronLeft size={16} className="mr-2"/> {t('previous')}
          </button>
        ) : <div></div>}
        <div className="flex items-center gap-4">
            {step === 1 && (
                <button
                    onClick={handleQuickGenerateStory}
                    disabled={!title || !summary}
                    className="flex items-center px-4 py-2 border border-primary-500 text-sm font-medium rounded-md text-primary-500 bg-transparent hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles size={16} className="mr-2" />
                    {t('quickWeaveCost', { cost: WE_TOKEN_COSTS.storyGeneration })}
                </button>
            )}
            {step < 5 ? (
              <button 
                onClick={nextStep} 
                disabled={(step === 1 && (!title || !summary))}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                {t('next')} <ChevronRight size={16} className="ml-2"/>
              </button>
            ) : <div></div>}
        </div>
      </div>
    </div>
  );
};

export default CreateStory;