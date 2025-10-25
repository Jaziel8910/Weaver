import React, { useState, useEffect, useContext, useRef } from 'react';
import type { Story, Chapter, DialogueLine, ChatbotMessage, Character } from '../types';
import { Menu, X, Settings, Type, Palette, AlignLeft, AlignJustify, Minus, Plus, Headphones, MessageSquare, Edit, Book, Save, Wand2, BookOpen, Send, Bot, User as UserIcon, History } from 'lucide-react';
import { generateAudiobookContent, extractDialogues, generateDialogueAudio, autocompleteStory, generateChatResponse } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { AppContext } from '../contexts/AppContext';
import { WE_TOKEN_COSTS } from '../constants';
import { useTranslation } from '../App';

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface StoryViewerProps {
  story: Story;
  updateStory: (updatedStory: Story) => void;
}

type ReadingTheme = 'dark' | 'sepia' | 'light';
type FontFamily = 'serif' | 'sans';
type TextAlignment = 'left' | 'justify';
type ViewMode = 'read' | 'dialogue' | 'edit';
type ChatbotMode = 'analyze' | 'character_chat';


interface ReadingSettings {
    fontSize: number;
    fontFamily: FontFamily;
    theme: ReadingTheme;
    textAlign: TextAlignment;
}

const themeClasses = {
    dark: 'bg-gray-900 text-gray-300',
    sepia: 'bg-sepia-bg text-sepia-text',
    light: 'bg-light-bg text-light-text',
};

const Chatbot: React.FC<{
    story: Story;
    currentChapter: Chapter;
    onClose: () => void;
}> = ({ story, currentChapter, onClose }) => {
    const { consumeWeTokens } = useContext(AppContext);
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatbotMessage[]>([
        { sender: 'ai', content: t('chatbotGreeting') }
    ]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<ChatbotMode>('analyze');
    const [selectedCharacter, setSelectedCharacter] = useState<Character>(story.characters[0]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        if (!consumeWeTokens(WE_TOKEN_COSTS.chatbotMessage)) return;

        const userMessage: ChatbotMessage = { sender: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        let prompt = '';
        if (mode === 'analyze') {
            prompt = `You are a helpful literary assistant. Based on the following story context and specific chapter, answer the user's question. You can quote parts of the text using markdown blockquotes.
            Story Title: ${story.title}
            Story Summary: ${story.summary}
            Current Chapter (${currentChapter.title}):
            ---
            ${currentChapter.content}
            ---
            User Question: ${input}`;
        } else {
            prompt = `You are role-playing as the character "${selectedCharacter.name}" from the story "${story.title}".
            Your personality: ${selectedCharacter.description}. Motivation: ${selectedCharacter.motivation}. Flaws: ${selectedCharacter.flaws}.
            You are currently in the context of this chapter:
            ---
            ${currentChapter.content}
            ---
            Respond to the user's message in character. Keep your responses conversational and true to your personality.
            User Message: ${input}`;
        }

        const response = await generateChatResponse(prompt);
        
        const aiMessage: ChatbotMessage = {
            sender: mode === 'analyze' ? 'ai' : 'character',
            content: response,
            characterName: mode === 'character_chat' ? selectedCharacter.name : undefined,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsThinking(false);
    };

    return (
        <div className="absolute z-40 top-0 right-0 w-full max-w-md h-full bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl animate-fade-in-left">
            <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-white">{t('storyAssistant')}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </header>
            <div className="p-2 bg-gray-700/50 flex-shrink-0">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMode('analyze')} className={`py-2 rounded-md text-sm ${mode === 'analyze' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('analyzeStory')}</button>
                    <button onClick={() => setMode('character_chat')} className={`py-2 rounded-md text-sm ${mode === 'character_chat' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('characterChat')}</button>
                </div>
                {mode === 'character_chat' && (
                    <select value={selectedCharacter.name} onChange={e => setSelectedCharacter(story.characters.find(c => c.name === e.target.value)!)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2 mt-2">
                        {story.characters.map(c => <option key={c.name} value={c.name}>{t('talkTo', {characterName: c.name})}</option>)}
                    </select>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                     <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender !== 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">{msg.sender === 'ai' ? <Bot size={20}/> : <UserIcon size={20}/>}</div>}
                        <div className={`max-w-xs md:max-w-sm p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-600' : 'bg-gray-700'}`}>
                           {msg.sender === 'character' && <p className="font-bold text-primary-400 text-sm">{msg.characterName}</p>}
                           <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isThinking && <div className="flex justify-start"><Spinner size={6} /></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700 flex items-center gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder={t('askQuestion')} className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"/>
                <button onClick={handleSend} className="p-2 bg-primary-500 rounded-lg text-white hover:bg-primary-600 disabled:bg-gray-500" disabled={isThinking}><Send size={20}/></button>
            </div>
        </div>
    );
}

const DialogueView: React.FC<{
    lines: DialogueLine[];
    characters: Character[];
    audioContext: AudioContext;
}> = ({ lines, characters, audioContext }) => {
    const { consumeWeTokens } = useContext(AppContext);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const playAudio = async (line: DialogueLine, index: number) => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }

        if (playingIndex === index || loadingIndex === index) {
            setPlayingIndex(null);
            setLoadingIndex(null);
            return;
        }

        if (!consumeWeTokens(WE_TOKEN_COSTS.dialogueAudio)) return;

        setLoadingIndex(index);
        setPlayingIndex(null);

        const character = characters.find(c => c.name === line.character);
        const voice = character?.voice || 'Kore';

        try {
            const audioB64 = await generateDialogueAudio(line.line, voice);
            if (audioB64) {
                const audioBuffer = await decodeAudioData(
                    decode(audioB64),
                    audioContext,
                    24000,
                    1
                );
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                audioSourceRef.current = source;
                setLoadingIndex(null);
                setPlayingIndex(index);
                source.onended = () => {
                    setPlayingIndex(null);
                    audioSourceRef.current = null;
                };
            } else {
                 setLoadingIndex(null);
            }
        } catch (error) {
            console.error("Error playing dialogue audio:", error);
            setLoadingIndex(null);
        }
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {lines.map((line, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <button 
                        onClick={() => playAudio(line, index)} 
                        className="p-2 rounded-full bg-gray-700 hover:bg-primary-500 text-white transition-colors flex-shrink-0"
                        disabled={loadingIndex !== null && loadingIndex !== index}
                    >
                        {loadingIndex === index ? <Spinner size={5}/> : playingIndex === index ? <X size={20}/> : <Headphones size={20}/>}
                    </button>
                    <div>
                        <p className="font-bold text-primary-400">{line.character}</p>
                        <p className="text-lg">{line.line}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const StoryViewer: React.FC<StoryViewerProps> = ({ story, updateStory }) => {
  const { consumeWeTokens } = useContext(AppContext);
  const { t } = useTranslation();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [isChapterSidebarOpen, setIsChapterSidebarOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('read');
  
  const [editedContent, setEditedContent] = useState('');
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [isExtractingDialogue, setIsExtractingDialogue] = useState(false);

  const [audioContext] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
  const [audiobookSource, setAudiobookSource] = useState<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const [isAutocompleting, setIsAutocompleting] = useState(false);

  const [settings, setSettings] = useState<ReadingSettings>({
      fontSize: 1.125,
      fontFamily: 'serif',
      theme: 'dark',
      textAlign: 'left',
  });

  const selectedChapter = story.chapters[selectedChapterIndex];

  useEffect(() => {
    if (audiobookSource) {
        audiobookSource.onended = null;
        audiobookSource.stop();
        setAudiobookSource(null);
        setIsPlaying(false);
    }
    setViewMode('read');
    setDialogueLines([]);
  }, [selectedChapterIndex, story.id]);

  useEffect(() => {
    if (viewMode === 'dialogue' && dialogueLines.length === 0) {
        setIsExtractingDialogue(true);
        extractDialogues(selectedChapter.content, story.characters).then(lines => {
            setDialogueLines(lines);
            setIsExtractingDialogue(false);
        });
    } else if (viewMode === 'edit') {
        setEditedContent(selectedChapter.content);
    }
  }, [viewMode, selectedChapter, story.characters, dialogueLines.length]);
  
  const handleSaveEdit = () => {
    const oldChapter = story.chapters[selectedChapterIndex];
    if (oldChapter.content === editedContent) {
        setViewMode('read');
        return;
    }

    const newHistoryEntry = { timestamp: Date.now(), content: oldChapter.content };
    const updatedHistory = oldChapter.history ? [newHistoryEntry, ...oldChapter.history] : [newHistoryEntry];

    const updatedChapter = { 
        ...oldChapter, 
        content: editedContent, 
        history: updatedHistory 
    };

    const newChapters = [...story.chapters];
    newChapters[selectedChapterIndex] = updatedChapter;
    
    updateStory({ ...story, chapters: newChapters });
    setViewMode('read');
  };

  const handleRestoreVersion = (content: string) => {
    setEditedContent(content);
    setIsHistoryPanelOpen(false);
    alert('Version restored to the editor. Click "Save" to make it the current version.');
  };

  const handleAutocomplete = async () => {
      if (!consumeWeTokens(WE_TOKEN_COSTS.autocomplete)) return;
      setIsAutocompleting(true);
      const newChaptersContent = await autocompleteStory(story);
      const parsedChapters: Chapter[] = newChaptersContent
        .split('---')
        .map(part => part.trim())
        .filter(part => part.startsWith('Chapter'))
        .map(part => {
            const lines = part.split('\n');
            const chapterTitle = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            return { title: chapterTitle, content };
        });
      
      if (parsedChapters.length > 0) {
          updateStory({ ...story, chapters: [...story.chapters, ...parsedChapters] });
      }
      setIsAutocompleting(false);
  };

  const toggleAudiobook = async () => {
    if (audiobookSource) {
      audiobookSource.onended = null;
      audiobookSource.stop();
      setAudiobookSource(null);
      setIsPlaying(false);
      return;
    }
    
    if (!consumeWeTokens(WE_TOKEN_COSTS.audiobook)) return;

    setIsGeneratingAudio(true);
    const audioB64 = await generateAudiobookContent(selectedChapter.content);
    setIsGeneratingAudio(false);
    if (audioB64) {
      const audioBuffer = await decodeAudioData(
        decode(audioB64),
        audioContext,
        24000,
        1,
      );
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      setAudiobookSource(source);
      setIsPlaying(true);
      source.onended = () => {
        setIsPlaying(false);
        setAudiobookSource(null);
      };
    }
  };

  const changeFontSize = (delta: number) => {
    setSettings(s => ({...s, fontSize: Math.max(0.8, Math.min(2, s.fontSize + delta))}));
  }

  const mainContentClass = `flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${themeClasses[settings.theme]}`;
  const fontClass = settings.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  const textAlignClass = settings.textAlign === 'justify' ? 'text-justify' : 'text-left';
  
  const renderMainContent = () => {
      if (isAutocompleting) {
           return (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Spinner size={16} />
                <h2 className="text-3xl font-bold text-white mt-8">{t('autocompletingTitle')}</h2>
                <p className="text-gray-400 mt-2 max-w-md">{t('autocompletingSubtitle')}</p>
              </div>
            );
      }
      switch (viewMode) {
          case 'dialogue':
              return isExtractingDialogue ? <Spinner size={12}/> : <DialogueView lines={dialogueLines} characters={story.characters} audioContext={audioContext}/>;
          case 'read':
          default:
              return (
                 <div 
                    className={`prose prose-invert max-w-none leading-relaxed whitespace-pre-wrap selection:bg-primary-500/30 ${fontClass} ${textAlignClass}`}
                    style={{ fontSize: `${settings.fontSize}rem`, color: 'inherit' }}
                >
                    <p>{selectedChapter.content}</p>
                 </div>
              );
      }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      <aside className={`absolute z-30 w-80 bg-gray-800 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isChapterSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-4 border-b border-gray-700 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">{t('chapters')}</h2>
              <button onClick={() => setIsChapterSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
         </div>
        <nav className="flex-1 overflow-y-auto p-2">
            <ul>
                {story.chapters.map((chapter, index) => (
                    <li key={index}>
                        <button 
                            onClick={() => {
                                setSelectedChapterIndex(index);
                                setIsChapterSidebarOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 ${
                                index === selectedChapterIndex
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {chapter.title}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
             <button onClick={handleAutocomplete} disabled={isAutocompleting} className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                <Wand2 size={20} className="mr-2"/> {t('autocompleteStory')} (-{WE_TOKEN_COSTS.autocomplete} WT)
            </button>
        </div>
      </aside>
      
      <aside className={`absolute z-40 w-96 bg-gray-800 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out right-0 ${isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{t('versionHistory')}</h2>
            <button onClick={() => setIsHistoryPanelOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {selectedChapter.history && selectedChapter.history.length > 0 ? (
                <ul className="space-y-2">
                    {selectedChapter.history.map((version) => (
                        <li key={version.timestamp}>
                            <div className="p-3 rounded-md bg-gray-700/50">
                                <p className="text-sm font-semibold text-gray-300">{t('savedOn')} {new Date(version.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{version.content}</p>
                                <button 
                                    onClick={() => handleRestoreVersion(version.content)}
                                    className="mt-2 text-sm font-bold text-primary-500 hover:text-primary-400"
                                >
                                    {t('restore')}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-4 text-center text-gray-500 mt-10">
                    <History size={48} className="mx-auto mb-4"/>
                    <p>{t('noHistory')}</p>
                </div>
            )}
        </div>
      </aside>

      <div className={mainContentClass}>
        <header className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 lg:bg-transparent lg:border-none lg:absolute lg:top-0 lg:left-0 lg:right-0 lg:z-10">
            <div className="flex items-center">
                <div className="flex items-center">
                     <h1 className="text-xl font-bold text-white truncate">{story.title}</h1>
                     <p className="text-sm text-gray-400 hidden sm:block ml-4">{t('by')} {story.author}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
                <button title={t('audiobook')} onClick={toggleAudiobook} className={`p-2 rounded-md transition-colors ${isPlaying ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}>
                    {isGeneratingAudio ? <Spinner size={5}/> : <Headphones size={20}/>}
                </button>
                 <button title={t('readMode')} onClick={() => setViewMode('read')} className={`p-2 rounded-md transition-colors ${viewMode === 'read' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><Book size={20}/></button>
                 <button title={t('dialogueMode')} onClick={() => setViewMode('dialogue')} className={`p-2 rounded-md transition-colors ${viewMode === 'dialogue' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><MessageSquare size={20}/></button>
                 <button title={t('storyAssistant')} onClick={() => setIsChatbotOpen(true)} className={`p-2 rounded-md transition-colors ${isChatbotOpen ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><Bot size={20}/></button>
                 <button title={t('editMode')} onClick={() => setViewMode('edit')} className={`p-2 rounded-md transition-colors ${viewMode === 'edit' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><Edit size={20}/></button>
                 <div className="border-l border-gray-600 h-6 mx-1"></div>
                <button title={t('chapters')} onClick={() => setIsChapterSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white"><BookOpen size={20}/></button>
                <button title={t('settingsPanel')} onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)} className="p-2 text-gray-400 hover:text-white"><Settings size={20}/></button>
            </div>
        </header>
        
        {isSettingsPanelOpen && (
            <div className="absolute top-16 right-4 z-20 w-72 bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-700 animate-fade-in-down">
                 <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2"><Type size={14} className="mr-2"/> {t('fontSize')}</label>
                        <div className="flex items-center justify-between bg-gray-700 rounded-md p-1">
                            <button onClick={() => changeFontSize(-0.125)} className="px-4 py-1 rounded hover:bg-gray-600"><Minus size={16}/></button>
                            <span className="text-sm font-mono">{settings.fontSize.toFixed(2)}rem</span>
                            <button onClick={() => changeFontSize(0.125)} className="px-4 py-1 rounded hover:bg-gray-600"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div>
                         <label className="text-sm font-medium text-gray-300 mb-2 block">{t('fontFamily')}</label>
                         <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setSettings(s => ({...s, fontFamily: 'serif'}))} className={`py-2 rounded-md text-sm ${settings.fontFamily === 'serif' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('serif')}</button>
                             <button onClick={() => setSettings(s => ({...s, fontFamily: 'sans'}))} className={`py-2 rounded-md text-sm ${settings.fontFamily === 'sans' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('sansSerif')}</button>
                         </div>
                    </div>
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2"><Palette size={14} className="mr-2"/> {t('theme')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setSettings(s => ({...s, theme: 'dark'}))} className={`py-2 rounded-md text-sm border-2 ${settings.theme === 'dark' ? 'border-primary-500' : 'border-transparent'} bg-gray-900`}>{t('dark')}</button>
                             <button onClick={() => setSettings(s => ({...s, theme: 'sepia'}))} className={`py-2 rounded-md text-sm border-2 ${settings.theme === 'sepia' ? 'border-primary-500' : 'border-transparent'} bg-sepia-bg`}>{t('sepia')}</button>
                             <button onClick={() => setSettings(s => ({...s, theme: 'light'}))} className={`py-2 rounded-md text-sm border-2 ${settings.theme === 'light' ? 'border-primary-500' : 'border-transparent'} bg-light-bg`}>{t('light')}</button>
                        </div>
                    </div>
                     <div>
                         <label className="text-sm font-medium text-gray-300 mb-2 block">{t('alignment')}</label>
                         <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setSettings(s => ({...s, textAlign: 'left'}))} className={`py-2 rounded-md text-sm flex justify-center ${settings.textAlign === 'left' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}><AlignLeft size={20}/></button>
                             <button onClick={() => setSettings(s => ({...s, textAlign: 'justify'}))} className={`py-2 rounded-md text-sm flex justify-center ${settings.textAlign === 'justify' ? 'bg-primary-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}><AlignJustify size={20}/></button>
                         </div>
                    </div>
                </div>
            </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pt-24 flex justify-center">
             <div className="max-w-4xl mx-auto w-full">
                 {viewMode === 'edit' ? (
                    <div className="w-full">
                        <div className="flex-shrink-0 bg-gray-800 p-2 rounded-t-lg flex justify-between items-center border-b border-gray-700">
                           <p className="font-semibold text-gray-300 text-sm md:text-base">{t('editingChapter')}: <span className="text-white">{selectedChapter.title}</span></p>
                           <div className="flex items-center gap-2">
                               <button onClick={() => setIsHistoryPanelOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600">
                                   <History size={16} /> <span className="hidden md:inline">{t('versionHistory')}</span>
                               </button>
                               <button onClick={() => setViewMode('read')} className="px-3 py-1.5 text-sm rounded-md bg-gray-600 hover:bg-gray-500">{t('cancel')}</button>
                               <button onClick={handleSaveEdit} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary-600 hover:bg-primary-700 text-white">
                                   <Save size={16} /> {t('save')}
                               </button>
                           </div>
                       </div>
                       <div className="bg-gray-800/50 rounded-b-lg">
                           <textarea 
                               value={editedContent}
                               onChange={(e) => setEditedContent(e.target.value)}
                               className={`w-full h-[65vh] bg-transparent resize-none p-4 md:p-8 focus:outline-none ${fontClass} ${textAlignClass}`}
                               style={{ fontSize: `${settings.fontSize}rem`, color: 'inherit' }}
                               placeholder="Start writing..."
                           />
                       </div>
                   </div>
                 ) : (
                    <>
                        <h2 className={`text-4xl font-bold mb-6 ${fontClass} ${settings.theme === 'dark' ? 'text-white' : ''}`}>{selectedChapter.title}</h2>
                        {renderMainContent()}
                    </>
                 )}
            </div>
        </main>
      </div>
      {isChatbotOpen && <Chatbot story={story} currentChapter={selectedChapter} onClose={() => setIsChatbotOpen(false)} />}
    </div>
  );
};

export default StoryViewer;