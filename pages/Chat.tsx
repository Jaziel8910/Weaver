import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../App';
import { generateChatResponse } from '../services/geminiService';
import { Lightbulb, Send, Bot, User as UserIcon } from 'lucide-react';
import Spinner from '../components/Spinner';
import type { ChatbotMessage, Universe, Character } from '../types';
import { WE_TOKEN_COSTS } from '../constants';

const Chat: React.FC = () => {
    const { t } = useTranslation();
    const { universes, stories, consumeWeTokens, user } = useContext(AppContext);

    const [mode, setMode] = useState<'ideas' | 'lore' | 'character'>('ideas');
    const [selectedUniverseId, setSelectedUniverseId] = useState<string>('');
    const [selectedCharacterName, setSelectedCharacterName] = useState<string>('');
    const [messages, setMessages] = useState<ChatbotMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedUniverse = universes.find(u => u.id === selectedUniverseId);
    const selectedCharacter = selectedUniverse?.characters.find(c => c.name === selectedCharacterName);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (universes.length > 0) {
            setSelectedUniverseId(universes[0].id);
        }
    }, [universes]);

     useEffect(() => {
        if (selectedUniverse?.characters.length) {
            setSelectedCharacterName(selectedUniverse.characters[0].name);
        } else {
            setSelectedCharacterName('');
        }
    }, [selectedUniverseId, universes]);

    const getPlaceholder = () => {
        switch(mode) {
            case 'ideas': return t('chatPlaceholderIdeas');
            case 'lore': return t('chatPlaceholderLore');
            case 'character': return t('chatPlaceholderCharacter');
            default: return '...';
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;
        if (!consumeWeTokens(WE_TOKEN_COSTS.chatbotMessage)) return;

        const userMessage: ChatbotMessage = { sender: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsThinking(true);

        let prompt = '';
        switch(mode) {
            case 'ideas':
                prompt = `You are an expert in narrative and worldbuilding. A user is asking for help with their story. Provide creative and helpful suggestions based on their request.\n\nUser request: "${input}"`;
                break;
            case 'lore':
                if (!selectedUniverse) {
                    setIsThinking(false);
                    return;
                }
                prompt = `You are an expert on the fictional universe of "${selectedUniverse.name}". Your knowledge comes from the established canon rules and story summaries. Answer the user's question based on this information.\n\nUniverse Rules:\n${selectedUniverse.rules.join('\n')}\n\nStories in this universe:\n${stories.filter(s => s.universe === selectedUniverse.name).map(s => `- ${s.title}: ${s.summary}`).join('\n')}\n\nUser Question: "${input}"`;
                break;
            case 'character':
                if (!selectedCharacter) {
                     setIsThinking(false);
                    return;
                }
                prompt = `You are role-playing as the character "${selectedCharacter.name}".\n\nYour personality: ${selectedCharacter.description}.\nAppearance: ${selectedCharacter.appearance}\nMotivation: ${selectedCharacter.motivation}\nFlaws: ${selectedCharacter.flaws}\nRelationships: ${selectedCharacter.relationships}\n\nRespond to the user's message in character. Keep your responses conversational and true to your personality.\n\nUser Message: "${input}"`;
                break;
        }

        const response = await generateChatResponse(prompt);
        
        const aiMessage: ChatbotMessage = {
            sender: mode === 'character' ? 'character' : 'ai',
            content: response,
            characterName: mode === 'character' ? selectedCharacter?.name : undefined,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsThinking(false);
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white">{t('chatTitle')}</h1>
                <p className="text-gray-400 mt-2">{t('chatSubtitle')}</p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('chatMode')}</label>
                    <select value={mode} onChange={e => setMode(e.target.value as any)} className="w-full md:w-48 bg-gray-800 border border-gray-600 rounded-lg p-2">
                        <option value="ideas">{t('ideasGenerator')}</option>
                        <option value="lore">{t('loreConsultant')}</option>
                        <option value="character">{t('characterRoleplay')}</option>
                    </select>
                </div>
                 {mode !== 'ideas' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">{t('selectUniverse')}</label>
                             <select value={selectedUniverseId} onChange={e => setSelectedUniverseId(e.target.value)} className="w-full md:w-48 bg-gray-800 border border-gray-600 rounded-lg p-2" disabled={universes.length === 0}>
                                {universes.length > 0 ? universes.map(u => <option key={u.id} value={u.id}>{u.name}</option>) : <option>No universes found</option>}
                            </select>
                        </div>
                        {mode === 'character' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t('selectCharacter')}</label>
                                <select value={selectedCharacterName} onChange={e => setSelectedCharacterName(e.target.value)} className="w-full md:w-48 bg-gray-800 border border-gray-600 rounded-lg p-2" disabled={!selectedUniverse || selectedUniverse.characters.length === 0}>
                                    {selectedUniverse?.characters.length ? selectedUniverse.characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>) : <option>No characters in this universe</option>}
                                </select>
                            </div>
                        )}
                    </>
                 )}
            </div>

            <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 overflow-y-auto p-4 space-y-4 flex flex-col">
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                        <Lightbulb size={64} />
                        <p className="mt-4">Your brainstorming session begins here.</p>
                    </div>
                )}
                <div className="flex-1 space-y-4">
                    {messages.map((msg, index) => (
                         <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender !== 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">{msg.sender === 'ai' ? <Bot size={20}/> : <UserIcon size={20}/>}</div>}
                            <div className={`max-w-xs md:max-w-2xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-600' : 'bg-gray-700'}`}>
                               {msg.sender === 'character' && <p className="font-bold text-primary-400 text-sm">{msg.characterName}</p>}
                               <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && <div className="flex justify-start"><Spinner size={6} /></div>}
                </div>
                <div ref={messagesEndRef} />
            </div>

             <div className="mt-4 flex items-center gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder={getPlaceholder()} className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"/>
                <button onClick={handleSend} className="p-3 bg-primary-500 rounded-lg text-white hover:bg-primary-600 disabled:bg-gray-500" disabled={isThinking}>
                    <Send size={20}/>
                </button>
            </div>
        </div>
    );
};

export default Chat;
