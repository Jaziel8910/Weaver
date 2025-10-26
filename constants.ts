import React from 'react';
import type { Story, User, ChangelogItem, Challenge, Plan, Mission } from './types';
import { Star, Zap, Gem } from 'lucide-react';


export const initialStories: Story[] = [
  {
    id: '1',
    title: 'The Crimson Cipher',
    author: 'Gemini & You',
    summary: 'In a neon-drenched cyberpunk city, a renegade data courier stumbles upon a cryptic message that could bring down the ruling corporation, or cost her everything.',
    coverImageUrl: 'https://picsum.photos/seed/crimson/600/800',
    bannerVideoUrl: 'https://picsum.photos/seed/crimson-banner/1200/400', // ULTRA feature
    universe: 'Neo-Kyoto, 2088',
    characters: [{ name: 'Kael', description: 'A skilled netrunner with a mysterious past.', role: 'Protagonist', arc: 'The Hero\'s Journey', appearance: 'Tall, cybernetic arm, scar over left eye', motivation: 'To find their lost sibling', flaws: 'Overly impulsive, trusts no one', relationships: 'Rivals with the Shadow Syndicate'}],
    plot: 'Kael must deliver the cipher before the corporate assassins find her.',
    chapters: [
      {
        title: 'Chapter 1: The Glitch in the System',
        content: 'The rain fell in sheets, each drop reflecting the holographic advertisements that painted the towering skyscrapers of Neo-Kyoto. Kael adjusted the collar of her synth-leather jacket, the data chip warm against her skin. This was it. The job that would set her up for life, or end it...'
      },
      {
        title: 'Chapter 2: Echoes of the Past',
        content: 'The safe house was a dingy room above a noodle shop, the smell of soy and ginger a constant presence. Kael jacked into the console, her cybernetic eyes scanning lines of code. The cipher was more than just data; it was a ghost, a digital echo of a project long thought buried...'
      }
    ],
    tags: {
      genre: 'Cyberpunk',
      targetAudience: 'Adult',
      themes: ['Conspiracy', 'Technology', 'Rebellion'],
      plotDevices: ['MacGuffin', 'Femme Fatale']
    },
    rating: { ai: 4.5, community: 4.8 },
    stats: { reads: 12400, weBucksEarned: 350 },
    contentWarnings: ['Violencia Moderada', 'Lenguaje Moderado', 'Consumo de Alcohol (Implícito)']
  },
   {
    id: '2',
    title: 'Whispers of the Sunstone',
    author: 'Gemini & You',
    summary: 'An ancient prophecy, a forgotten kingdom, and a young sorceress who holds the key. Elara must find the Sunstone to save her world from eternal darkness.',
    coverImageUrl: 'https://picsum.photos/seed/sunstone/600/800',
    universe: 'The Fading Lands of Aethel',
    characters: [{ name: 'Elara', description: 'A sorceress with untrained but powerful magic.', role: 'Protagonist', arc: 'The Hero\'s Journey', appearance: 'Flowing white hair, eyes that glow faintly', motivation: 'To restore magic to her land', flaws: 'Naive and too trusting', relationships: 'Guided by an ancient spirit'}],
    plot: 'Elara embarks on a quest to find the legendary Sunstone, hunted by the Shadow Syndicate.',
    chapters: [
      {
        title: 'Chapter 1: A Fading Light',
        content: 'The village of Silverwood was shrouded in a perpetual twilight. The Great Trees, once vibrant with magical energy, were slowly dying. Elara watched from her window as another leaf turned to ash, a silent testament to the encroaching darkness...'
      }
    ],
    tags: {
      genre: 'Fantasy',
      targetAudience: 'Young Adult',
      themes: ['Good vs. Evil', 'Destiny', 'Magic'],
      plotDevices: ['Prophecy']
    },
    rating: { ai: 4.2, community: 4.6 },
    stats: { reads: 8900, weBucksEarned: 210 },
    contentWarnings: ['Violencia de Fantasía', 'Amenaza Suave']
  },
  {
    id: '3',
    title: 'Void Drifters',
    author: 'Gemini & You',
    summary: 'The last remnants of humanity drift through space on a flotilla of aging starships, searching for a new home while fleeing a mysterious cosmic entity.',
    coverImageUrl: 'https://picsum.photos/seed/void/600/800',
    universe: 'The great expanse of the cosmos',
    characters: [{ name: 'Jax', description: 'A cynical but brilliant pilot.', role: 'Protagonist', arc: 'The Hero\'s Journey', appearance: 'Worn flight suit, tired eyes', motivation: 'To find a habitable planet', flaws: 'Pushes people away', relationships: 'Complicated history with the ship\'s AI'}],
    plot: 'A cryptic signal offers a glimmer of hope, leading the fleet into uncharted and dangerous territory.',
    chapters: [
      {
        title: 'Chapter 1: The Long Silence',
        content: 'The only constant was the hum of the life support and the endless black outside the viewport. Jax ran a diagnostic on the nav-console for the hundredth time. All green. All silent. Too silent...'
      }
    ],
    tags: {
      genre: 'Sci-Fi',
      targetAudience: 'Adult',
      themes: ['Survival', 'Hope', 'Existentialism'],
      plotDevices: ['Red Herring']
    },
    rating: { ai: 4.8, community: 4.9 },
    stats: { reads: 25100, weBucksEarned: 820 },
    contentWarnings: ['Crisis Existencial', 'Lenguaje Suave']
  }
];

export const changelogData: ChangelogItem[] = [
  {
    version: 'Beta v0.2.0 - The Foundation Update',
    date: 'November 2, 2023',
    changes: [
      'Implemented User Accounts! You can now register and log in.',
      'Introduced WeBucks, the official currency of Weaver.',
      'Added the Store where you can buy plans with WeBucks.',
      'Overhauled Membership Tiers with new benefits and pricing.',
      'Added Missions to earn WeBucks for completing tasks.',
      'Your account data is now saved locally in your browser.',
    ],
  },
  {
    version: 'Beta v0.1.0',
    date: 'October 26, 2023',
    changes: [
      'Weaver platform initiated!',
      'Core modules online: Hub, Stories, Account, and Changelog.',
      'Initial integration with Gemini API for story and cover generation.',
      'Implemented WeaPoints and Tier system (cosmetic for now).',
      'Users can now create their first stories through the creation wizard.',
    ],
  },
];

export const featuredStory: Story = initialStories[0];

export const trendingStories: Pick<Story, 'id' | 'title' | 'author'>[] = [
  { id: '2', title: 'Whispers of the Sunstone', author: 'Gemini & You' },
  { id: '3', title: 'Void Drifters', author: 'Gemini & You' },
  { id: '1', title: 'The Crimson Cipher', author: 'Gemini & You' },
];

export const weeklyChallenge: Challenge = {
  title: 'The Silent City',
  prompt: 'Write a story about a city that has fallen completely silent overnight. What happened, and who is left to find out?',
  endDate: 'in 3 days',
};

export const plans: Plan[] = [
    { 
        name: 'Free', 
        icon: React.createElement(Star, { size: 24, className: "text-gray-400" }),
        benefits: [
            'Basic story generation with Gemini Flash Lite', 
            'Generate up to 3 stories per month',
            'Standard quality cover art',
            'Community access',
        ],
        weTokenAllowance: 30,
        weTokenRefreshDays: 1,
    },
    { 
        name: 'Pro', 
        icon: React.createElement(Zap, { size: 24, className: "text-yellow-400" }),
        benefits: [
            'All Free benefits, plus:',
            'Expanded generation options', 
            'Unlimited story creation',
            'High-quality cover art generation',
            'Audiobook & Dialogue mode access',
            'Early access to new features'
        ],
        price: { weBucks: 2500, durationDays: 30 },
        weTokenAllowance: 100,
        weTokenRefreshDays: 1,
    },
    { 
        name: 'Ultra', 
        icon: React.createElement(Gem, { size: 24, className: "text-purple-400" }),
        benefits: [
            'All Pro benefits, plus:',
            'Create "What-If?" alternative story branches',
            'Access to experimental features (e.g., world-building tools)',
            'Exclusive profile customizations',
            'Highest WeBucks earning multiplier on missions'
        ],
        price: { weBucks: 6000, durationDays: 30 },
        weTokenAllowance: 180,
        weTokenRefreshDays: 2,
    },
];

export const missions: Mission[] = [
    {
        id: 'first-story',
        title: 'Budding Author',
        description: 'Create your very first story on Weaver.',
        reward: 150,
        isCompleted: (user, stories) => stories.length > 0
    },
    {
        id: 'three-stories',
        title: 'Story Spinner',
        description: 'Create at least 3 different stories.',
        reward: 300,
        isCompleted: (user, stories) => stories.length >= 3
    },
    {
        id: 'read-chapter',
        title: 'Avid Reader',
        description: 'Finish reading a chapter of any story.',
        reward: 50,
        isCompleted: (user, stories) => false // Note: Reading progress not tracked yet
    },
    {
        id: 'login-streak',
        title: 'Daily Weaver',
        description: 'Log in for 3 consecutive days.',
        reward: 100,
        isCompleted: (user, stories) => false // Note: Login streak not tracked yet
    }
];

export const WE_TOKEN_COSTS = {
    storyGeneration: 10,
    autocomplete: 8,
    audiobook: 5,
    dialogueAudio: 1.5,
    chatbotMessage: 2,
    whatIfGeneration: 15,
    universeCrystallize: 12,
    crossoverLore: 2,
    crossoverChapter: 20,
    crossoverArt: 15,
    characterConceptArt: 10,
};

export const detailedContentRatings = [
    {
      "rating": "E",
      "age_min": "3+",
      "description": "Contenido para todas las edades. Temas simples, educativos y familiares.",
      "tags": [ "Temas Leves", "Comedia Familiar", "Amistad", "Aventuras Leves", "Fantasía Infantil", "Animales Parlantes", "Contenido Educativo", "Humor Sencillo", "Magia Simple", "Juegos", "Exploración", "Resolución de Puzzles", "Creatividad", "Valores Positivos", "Narrativa Simple" ]
    },
    {
      "rating": "7+",
      "age_min": "7+",
      "description": "Contenido apto para niños pequeños. Incluye acción no realista o miedo suave.",
      "tags": [ "Violencia Cómica", "Violencia de Fantasía", "Amenaza Suave", "Temas de Duelo Leves", "Acoso Escolar (Resuelto)", "Lenguaje Muy Suave", "Riesgo Mínimo", "Criaturas Asustadizas", "Muerte (Implícita)", "Tensión Leve", "Separación Temporal", "Acción no Realista", "Misterio Simple", "Viajes en el Tiempo (Leve)", "Monstruos Amigables" ]
    },
    {
      "rating": "10+",
      "age_min": "10+",
      "description": "Contenido apto para preadolescentes. Puede incluir drama, acción realista y temas de la vida real.",
      "tags": [ "Violencia de Dibujos Animados", "Uso Implícito de Drogas", "Fumar (Personajes)", "Aventura con Armas", "Contenido de Miedo", "Temas de Guerra (No Explícito)", "Uso Leve de Alcohol", "Drama Familiar", "Temas de Identidad", "Ciencia Ficción Leve", "Romance Asexual", "Suspenso Breve", "Peleas Coreografiadas", "Problemas de Autoestima", "Intrigas Políticas (Leves)" ]
    },
    {
      "rating": "12+",
      "age_min": "12+",
      "description": "Contenido para adolescentes. Incluye violencia moderada, lenguaje moderado y temas románticos.",
      "tags": [ "Violencia Moderada", "Lenguaje Moderado", "Sangre (Estilizada)", "Bullying (Abierto)", "Temas de Suicidio (Discusión Breve)", "Consumo de Alcohol (Implícito)", "Fan Service", "Shipping", "Romance Adolescente", "Temas de Abandono", "Primer Beso", "Ansiedad", "Depresión (Leve)", "Crimen (No Gráfico)", "Viajes Interdimensionales" ]
    },
    {
      "rating": "13+",
      "age_min": "13+",
      "description": "Contenido de tipo 'Jóvenes Adultos'. Temas complejos, drama intenso, violencia más realista.",
      "tags": [ "Violencia Realista", "Terror Psicológico", "Muerte Explícita", "Sangre (Realista)", "Consumo de Drogas (Discusión)", "Trauma", "Autolesión (Discusión)", "Temas Sexuales (Implícitos)", "Desnudez (Implícita)", "Crisis Existencial", "Temas Religiosos Conflictivos", "Humor Negro", "Romance Homosexual (Implícito)", "Escenas de Hospital", "Discusión de Ética" ]
    },
    {
      "rating": "16+",
      "age_min": "16+",
      "description": "Contenido maduro. Aborda temas oscuros, violencia gráfica y lenguaje fuerte.",
      "tags": [ "Violencia Extrema", "Abuso", "Tortura", "Desnudez (Parcial)", "Lenguaje Fuerte", "Consumo de Drogas Explícito", "Crimen Organizado", "Gore (Leve)", "Mutilación", "Escenas de Sexo (Implícitas)", "Violación (Discusión)", "Temas de Guerra (Explícito)", "Terror Corporal", "Violencia con Armas Blancas", "Romance Gay Explícito" ]
    },
    {
      "rating": "18+",
      "age_min": "18+",
      "description": "Contenido solo para adultos. Temas sexuales maduros, gore intenso y temas altamente sensibles.",
      "tags": [ "Gore (Intenso)", "Violencia Sexual (Implícita)", "Sexo Explícito (No Gráfico)", "Drogas Fuertes (Explícito)", "Prostitución", "Incesto (Discusión)", "Contenido Dark", "Temas de Muerte Detallados", "Contenido BDSM (Implícito)", "Tráfico de Personas", "Abuso Infantil (Discusión)", "Canibalismo (Implícito)", "Temas Paranormales Oscuros", "Cultos/Sectas", "Suicidio Explícito" ]
    },
    {
      "rating": "18+ NSFW",
      "age_min": "18+",
      "description": "Contenido explícitamente sexual y/o extremadamente gráfico. No apto para ningún público sensible.",
      "tags": [ "Sexo Detallado", "BDSM Explícito", "Fetichismo (Extremo)", "Violencia Gráfica", "Violación Explícita", "Contenido Non-Consensual (Explícito)", "Temas Taboo", "Desnudez Explícita Total", "Orina/Excremento", "Inyección de Drogas (Explícita)", "Canibalismo (Explícito)", "Necrofilia (Discusión)", "Mutilación Genital", "Gore Extremo", "Tortura Detallada" ]
    }
];

// Re-create the old structure for backward compatibility with geminiService and StoryDetails
export const contentRatingTags: Record<string, string[]> = detailedContentRatings.reduce((acc, curr) => {
    let key = curr.rating;
    if (curr.rating === 'E') {
        key = 'E / 3+';
    } else if (curr.rating === '18+ NSFW') {
        key = '18+ NSFW (Explícito)';
    }
    acc[key] = curr.tags;
    return acc;
}, {} as Record<string, string[]>);