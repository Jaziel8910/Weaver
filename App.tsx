import React, { useState, useCallback, useMemo, useEffect, createContext, useContext } from 'react';
import { Page, Story, User, Language, Plan, Universe, Character } from './types';
import { initialStories, plans } from './constants';
import Sidebar from './components/Sidebar';
import Hub from './pages/Hub';
import Stories from './pages/Stories';
import Account from './pages/Account';
import Changelog from './pages/Changelog';
import CreateStory from './pages/CreateStory';
import StoryViewer from './pages/StoryViewer';
import StoryDetails from './pages/StoryDetails';
import Guide from './pages/Guide';
import Store from './pages/Store';
import AuthPage from './pages/AuthPage';
import Universes from './pages/Universes';
import UniverseDetails from './pages/UniverseDetails';
import Chat from './pages/Chat';
import { AppContext } from './contexts/AppContext';
import Spinner from './components/Spinner';

// --- I18n & Language Management ---

const locales = {
  en: {
    // General
    by: 'by',
    tier: 'Tier',
    // Sidebar
    hub: 'Hub',
    myStories: 'My Stories',
    store: 'Store',
    account: 'Account',
    changelog: 'Changelog',
    guide: 'Guide',
    createNewStory: 'Create New Story',
    logout: 'Log Out',
    ideasChat: 'Ideas Chat',
    // Hub
    welcome: 'Welcome,',
    hubSubtitle: "Discover what's new or start your next adventure.",
    featuredStory: 'Featured Story',
    readMore: 'Read More',
    communityForum: 'Community Forum',
    forumDescription: 'Join the conversation! Share writing tips, collaborate on stories, or just chat with other Weavers.',
    goToForum: 'Go to Forum (Coming Soon)',
    trending: 'Trending',
    weeklyChallenge: 'Weekly Challenge',
    acceptChallenge: 'Accept Challenge',
    endsIn: 'Ends',
    // Stories
    storiesTitle: 'My Stories',
    storiesSubtitle: 'Your personal library of woven tales.',
    emptyLibraryTitle: 'Your library is empty.',
    emptyLibrarySubtitle: 'Click "New Story" to begin your first adventure.',
    // Account
    manageProfile: 'Manage your profile, tier, and WeTokens.',
    weBucksBalance: 'WeBucks Balance',
    weTokensBalance: 'WeTokens Balance',
    earnMoreInStore: 'Earn more by completing missions in the Store!',
    membershipTiers: 'Membership Tiers',
    exportData: 'Export Data',
    importData: 'ImportData',
    language: 'Language',
    planExpires: 'Expires',
    never: 'Never',
    nextRefresh: 'Next refresh',
    settings: 'Settings',
    accountData: 'Account Data',
    importTooltip: "To import an account, please log out and use the 'Import Account' feature on the login screen.",
    upgradeInStore: 'Upgrade in Store',
    // Store
    storeTitle: 'Store',
    storeSubtitle: 'Upgrade your experience and earn rewards.',
    plans: 'Plans',
    missions: 'Missions',
    selectPlanDuration: 'Select Plan Duration',
    days: 'Days',
    discountOff: 'OFF',
    forDuration: 'for {duration} days',
    currentlyActive: 'Currently Active',
    purchasePlan: 'Purchase Plan',
    claimReward: 'Claim Reward',
    claimed: 'Claimed',
    incomplete: 'Incomplete',
    // Create Story
    createTitle: 'Create New Story',
    createSubtitle: 'Follow the steps to bring your idea to life with AI.',
    step1Title: 'Step 1: Core Concept',
    storyTitle: 'Story Title',
    storyTitlePlaceholder: 'The Last Starlight',
    summary: 'One-Sentence Summary',
    summaryPlaceholder: 'A lone pilot must reignite a dying star to save the galaxy.',
    genre: 'Genre',
    targetAudience: 'Target Audience',
    themes: 'Core Themes (comma-separated)',
    themesPlaceholder: 'e.g., Hope, Sacrifice, Identity',
    step2Title: 'Step 2: World-Building',
    universeName: 'Universe Name',
    universeNamePlaceholder: 'e.g., Star-Fire Cycle, or your own new universe',
    createNewUniverse: 'Create New Universe',
    useExistingUniverse: 'Use Existing Universe',
    selectAUniversePrompt: 'Select a universe...',
    keyLocations: 'Key Locations',
    keyLocationsPlaceholder: 'e.g., The Crystal Spires of Aethel, The Rust-Markets of Neo-Kyoto',
    factions: 'Factions / Groups',
    factionsPlaceholder: 'e.g., The Sunstone Order (protectors), The Shadow Syndicate (antagonists)',
    techMagicLevel: 'Technology / Magic Level',
    historicalContext: 'Historical Context',
    historicalContextPlaceholder: 'e.g., 100 years after the Great War',
    step3Title: 'Step 3: Characters (Deep Dive)',
    characterName: 'Name',
    characterRole: 'Role',
    characterDescription: 'Core Description',
    characterDescriptionPlaceholder: 'A cynical pilot with a heart of gold',
    characterAppearance: 'Appearance',
    characterAppearancePlaceholder: 'Tall, cybernetic arm, scar over left eye',
    characterMotivation: 'Motivation',
    characterMotivationPlaceholder: 'To find their lost sibling',
    characterFlaws: 'Flaws',
    characterFlawsPlaceholder: 'Overly impulsive, trusts no one',
    characterRelationships: 'Relationships',
    characterRelationshipsPlaceholder: 'Rivals with Kael, mentored by Jax',
    characterArc: 'Character Arc',
    dialogueVoice: 'Dialogue Voice',
    addCharacter: '+ Add Another Character',
    importCharacter: 'Import from Universe',
    importCharactersFrom: 'Import Characters from "{universeName}"',
    noCanonicalCharacters: 'This universe has no canonical characters to import.',
    importNCharacters: 'Import {count} Character(s)',
    step4Title: 'Step 4: Plot & Narrative',
    plotOutline: 'Plot Outline',
    plotOutlinePlaceholder: 'Briefly outline the main events of your story. What happens in the beginning, middle, and end?',
    openingHook: 'Opening Hook Style',
    pacingArc: 'Pacing Arc',
    climaxStyle: 'Climax Style',
    endingType: 'Ending Type',
    plotDevices: 'Key Plot Devices (comma-separated)',
    plotDevicesPlaceholder: 'e.g., MacGuffin, Chekhov\'s Gun, Red Herring',
    step5Title: 'Step 5: Style & Tone',
    pov: 'Point of View',
    writingStyle: 'Narrative Style',
    dialogueStyle: 'Dialogue Style',
    tone: 'Tone',
    literaryInfluences: 'Literary Influences',
    literaryInfluencesPlaceholder: 'e.g., In the style of Tolkien, inspired by Blade Runner',
    coverArtStyle: 'Cover Art Style',
    weaveMyStory: 'Weave My Story! (-{cost} WeTokens)',
    quickWeaveCost: 'Quick Weave (-{cost} WeTokens)',
    previous: 'Previous',
    next: 'Next',
    generatingTitle: 'Weaving your tale...',
    generatingSubtitle: 'Gemini is crafting your chapters and designing your cover. This may take a moment. The best stories are worth the wait!',
    // Story Details
    startReading: 'Start Reading',
    details: 'Details',
    synopsis: 'Synopsis',
    universeAndLore: 'Universe & Lore',
    tags: 'Tags',
    contentRating: 'Content Rating',
    showContentWarnings: 'Show Content Warnings',
    thisStoryContains: 'This story contains content that may be sensitive to some readers, including:',
    aiGeneratedNotice: 'AI-generated rating. May not be fully accurate.',
    // Story Viewer
    chapters: 'Chapters',
    autocompleteStory: 'Autocomplete Story',
    audiobook: 'Audiobook',
    readMode: 'Read Mode',
    dialogueMode: 'Dialogue Mode',
    storyAssistant: 'Story Assistant',
    editMode: 'Edit Mode',
    settingsPanel: 'Settings',
    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    serif: 'Serif',
    sansSerif: 'Sans-serif',
    theme: 'Theme',
    dark: 'Dark',
    sepia: 'Sepia',
    light: 'Light',
    alignment: 'Alignment',
    cancel: 'Cancel',
    save: 'Save',
    autocompletingTitle: 'Finishing your story...',
    autocompletingSubtitle: 'Gemini is writing the final chapters with a brilliant conclusion. This might take a moment.',
    editingChapter: 'Editing Chapter',
    versionHistory: 'Version History',
    restore: 'Restore',
    savedOn: 'Saved on',
    noHistory: 'No version history available for this chapter.',
    whatIfScenario: 'What-If? Scenario',
    whatIfPrompt: 'What if...',
    whatIfPlaceholder: 'e.g., Kael ignores the message and decides to retire to a farm.',
    generateAlternativeScene: 'Generate Alternative Scene (-{cost} WT)',
    whatIfBenefit: 'Create "What-If?" alternative story branches',
    // Chatbot
    chatbotGreeting: "Hi! I'm your story assistant. Ask me about the plot, or switch to Character Chat to talk to someone from the story.",
    analyzeStory: 'Analyze Story',
    characterChat: 'Character Chat',
    talkTo: 'Talk to {characterName}',
    askQuestion: 'Ask a question...',
    // Auth Page
    welcomeBack: 'Welcome Back!',
    loginContinue: 'Log in to continue your journey.',
    joinWeaver: 'Join Weaver',
    createAccountPrompt: 'Create an account to start weaving.',
    importAccount: 'Import Account',
    unlockAccount: 'Unlock your encrypted account archive.',
    passwordRecovery: 'Password Recovery',
    recoverAccount: "Let's get you back into your account.",
    securityQuestion: 'Security Question',
    verifyIdentity: 'Verify your identity.',
    resetPassword: 'Reset Password',
    chooseNewPassword: 'Choose a strong new password.',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    newPassword: 'New Password',
    securityAnswer: 'Security Answer',
    yourAnswer: 'Your Answer',
    accountArchive: 'Account Archive',
    selectBackupFile: 'Select weaver_backup.json',
    unlockAndLogin: 'Unlock & Login',
    createAccount: 'Create Account',
    continue: 'Continue',
    verifyAnswer: 'Verify Answer',
    setNewPassword: 'Set New Password',
    login: 'Log In',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    haveAccount: 'Already have an account?',
    loginNormally: 'Log in normally',
    rememberPassword: 'Remember your password?',
    or: 'Or',
    decrypting: 'Decrypting account...',
    invalidLogin: 'Invalid email or password.',
    allFieldsRequired: 'All fields are required.',
    emailExists: 'An account with this email already exists.',
    importFailed: 'Failed to import: Invalid password or corrupt file.',
    noAccountForRecovery: 'No account found with that email, or no security question is set up.',
    incorrectAnswer: 'Incorrect answer. Please try again.',
    passwordResetSuccess: 'Password successfully reset! Please log in with your new password.',
    genericError: 'Something went wrong. Please start over.',
    continueAsGuest: 'Continue as Guest',
     // Guide
    guideTitle: 'Weaver Guide',
    guideSubtitle: 'Your complete manual for mastering the art of storytelling with Weaver and Gemini.',
    faq: 'Frequently Asked Questions',
    gettingStarted: 'Getting Started',
    coreFeatures: 'Core Features',
    advancedFeatures: 'Advanced Features',
    economy: 'WeBucks & WeTokens',
    plansAndTiers: 'Plans & Tiers',
    contentRatingSystem: 'Understanding the Content Rating System',
    // Universes
    universes: 'Universes',
    crystallize: 'Crystallize',
    crystallizeDescription: 'Analyze all stories in this universe with Gemini to generate a cohesive timeline, description, and character list.',
    canon: 'Canon',
    notebook: 'Notebook',
    rules: 'Universe Rules',
    rulesPlaceholder: 'e.g., 1. Magic always requires a sacrifice.\n2. FTL travel corrupts organic matter.',
    timeline: 'Timeline',
    generateTimeline: 'Generate Timeline with AI',
    canonicalCharacters: 'Canonical Characters',
    crossover: 'Fanfic Crossover',
    crossoverDescription: 'ULTRA PLAN: Use Gemini to insert your characters into existing franchises!',
    franchise: 'Franchise Name (e.g., Star Wars, Harry Potter)',
    fetchLore: 'Fetch Lore with Grounded Search',
    lore: 'Fetched Lore',
    infiltrate: 'Infiltrate Character',
    scenario: 'Scenario Prompt',
    scenarioPlaceholder: 'e.g., Elara appears during the Sorting Hat ceremony.',
    generateCrossoverChapter: 'Generate Crossover Chapter',
    generateCrossoverArt: 'Generate Concept Art',
    characterSheet: 'Character Sheet',
    conceptArt: 'Concept Art',
    generateArt: 'Generate Art',
    saveChanges: 'Save Changes',
    universeDescription: 'Universe Description',
    universeCreatedSuccess: 'Universe "{universeName}" created successfully!',
    promptCreateFirstStory: 'Would you like to write the first story in it?',
    createStory: 'Create Story',
    notNow: 'Not Now',
    // Ideas Chat
    chatTitle: 'Ideas Chat',
    chatSubtitle: 'Your personal AI brainstorming partner for plot, lore, and characters.',
    chatMode: 'Mode',
    ideasGenerator: 'Ideas Generator',
    loreConsultant: 'Lore Consultant',
    characterRoleplay: 'Character Roleplay',
    selectUniverse: 'Select a Universe',
    selectCharacter: 'Select a Character',
    chatPlaceholderIdeas: 'e.g., I need a plot twist for my sci-fi story...',
    chatPlaceholderLore: 'e.g., How does magic work in this universe?',
    chatPlaceholderCharacter: 'e.g., What would you do if you were betrayed?',
    
  },
  es: {
    // General
    by: 'por',
    tier: 'Nivel',
    // Sidebar
    hub: 'Central',
    myStories: 'Mis Historias',
    store: 'Tienda',
    account: 'Cuenta',
    changelog: 'Cambios',
    guide: 'Guía',
    createNewStory: 'Crear Nueva Historia',
    logout: 'Cerrar Sesión',
    ideasChat: 'Chat de Ideas',
    // Hub
    welcome: 'Bienvenido,',
    hubSubtitle: 'Descubre qué hay de nuevo o comienza tu próxima aventura.',
    featuredStory: 'Historia Destacada',
    readMore: 'Leer Más',
    communityForum: 'Foro de la Comunidad',
    forumDescription: '¡Únete a la conversación! Comparte consejos de escritura, colabora en historias o simplemente charla con otros Weavers.',
    goToForum: 'Ir al Foro (Próximamente)',
    trending: 'Tendencias',
    weeklyChallenge: 'Desafío Semanal',
    acceptChallenge: 'Aceptar Desafío',
    endsIn: 'Termina',
    // Stories
    storiesTitle: 'Mis Historias',
    storiesSubtitle: 'Tu biblioteca personal de historias tejidas.',
    emptyLibraryTitle: 'Tu biblioteca está vacía.',
    emptyLibrarySubtitle: 'Haz clic en "Nueva Historia" para comenzar tu primera aventura.',
    // Account
    manageProfile: 'Gestiona tu perfil, plan y WeTokens.',
    weBucksBalance: 'Saldo de WeBucks',
    weTokensBalance: 'Saldo de WeTokens',
    earnMoreInStore: '¡Gana más completando misiones en la Tienda!',
    membershipTiers: 'Niveles de Membresía',
    exportData: 'Exportar Datos',
    importData: 'Importar Datos',
    language: 'Idioma',
    planExpires: 'Expira',
    never: 'Nunca',
    nextRefresh: 'Próxima recarga',
    settings: 'Configuración',
    accountData: 'Datos de la Cuenta',
    importTooltip: "Para importar una cuenta, cierra sesión y usa la función 'Importar Cuenta' en la pantalla de inicio de sesión.",
    upgradeInStore: 'Mejorar en la Tienda',
    // Store
    storeTitle: 'Tienda',
    storeSubtitle: 'Mejora tu experiencia y gana recompensas.',
    plans: 'Planes',
    missions: 'Misiones',
    selectPlanDuration: 'Selecciona la Duración del Plan',
    days: 'Días',
    discountOff: 'DTO',
    forDuration: 'por {duration} días',
    currentlyActive: 'Activo Actualmente',
    purchasePlan: 'Comprar Plan',
    claimReward: 'Reclamar Recompensa',
    claimed: 'Reclamado',
    incomplete: 'Incompleto',
    // Create Story
    createTitle: 'Crear Nueva Historia',
    createSubtitle: 'Sigue los pasos para dar vida a tu idea con IA.',
    step1Title: 'Paso 1: Concepto Principal',
    storyTitle: 'Título de la Historia',
    storyTitlePlaceholder: 'La Última Luz Estelar',
    summary: 'Resumen en una frase',
    summaryPlaceholder: 'Un piloto solitario debe reactivar una estrella moribunda para salvar la galaxia.',
    genre: 'Género',
    targetAudience: 'Público Objetivo',
    themes: 'Temas Principales (separados por comas)',
    themesPlaceholder: 'Ej: Esperanza, Sacrificio, Identidad',
    step2Title: 'Paso 2: Construcción del Mundo',
    universeName: 'Nombre del Universo',
    universeNamePlaceholder: 'Ej: Ciclo del Fuego Estelar, o tu propio universo nuevo',
    createNewUniverse: 'Crear Nuevo Universo',
    useExistingUniverse: 'Usar Universo Existente',
    selectAUniversePrompt: 'Selecciona un universo...',
    keyLocations: 'Lugares Clave',
    keyLocationsPlaceholder: 'Ej: Las Agujas de Cristal de Aethel, Los Mercados de Óxido de Neo-Kyoto',
    factions: 'Facciones / Grupos',
    factionsPlaceholder: 'Ej: La Orden de la Piedra Solar (protectores), El Sindicato de la Sombra (antagonistas)',
    techMagicLevel: 'Nivel de Tecnología / Magia',
    historicalContext: 'Contexto Histórico',
    historicalContextPlaceholder: 'Ej: 100 años después de la Gran Guerra',
    step3Title: 'Paso 3: Personajes (A Fondo)',
    characterName: 'Nombre',
    characterRole: 'Rol',
    characterDescription: 'Descripción Principal',
    characterDescriptionPlaceholder: 'Un piloto cínico con un corazón de oro',
    characterAppearance: 'Apariencia',
    characterAppearancePlaceholder: 'Alto, brazo cibernético, cicatriz sobre el ojo izquierdo',
    characterMotivation: 'Motivación',
    characterMotivationPlaceholder: 'Encontrar a su hermano perdido',
    characterFlaws: 'Defectos',
    characterFlawsPlaceholder: 'Demasiado impulsivo, no confía en nadie',
    characterRelationships: 'Relaciones',
    characterRelationshipsPlaceholder: 'Rivales con Kael, mentorizado por Jax',
    characterArc: 'Arco del Personaje',
    dialogueVoice: 'Voz de Diálogo',
    addCharacter: '+ Añadir Otro Personaje',
    importCharacter: 'Importar desde Universo',
    importCharactersFrom: 'Importar Personajes de "{universeName}"',
    noCanonicalCharacters: 'Este universo no tiene personajes canónicos para importar.',
    importNCharacters: 'Importar {count} Personaje(s)',
    step4Title: 'Paso 4: Trama y Narrativa',
    plotOutline: 'Esquema de la Trama',
    plotOutlinePlaceholder: 'Describe brevemente los eventos principales de tu historia. ¿Qué sucede al principio, en el medio y al final?',
    openingHook: 'Gancho Inicial',
    pacingArc: 'Arco de Ritmo',
    climaxStyle: 'Estilo del Clímax',
    endingType: 'Tipo de Final',
    plotDevices: 'Recursos Narrativos Clave (separados por comas)',
    plotDevicesPlaceholder: 'Ej: MacGuffin, Arma de Chéjov, Pista Falsa',
    step5Title: 'Paso 5: Estilo y Tono',
    pov: 'Punto de Vista',
    writingStyle: 'Estilo Narrativo',
    dialogueStyle: 'Estilo de Diálogo',
    tone: 'Tono',
    literaryInfluences: 'Influencias Literarias',
    literaryInfluencesPlaceholder: 'Ej: Al estilo de Tolkien, inspirado en Blade Runner',
    coverArtStyle: 'Estilo de Arte de Portada',
    weaveMyStory: '¡Tejer Mi Historia! (-{cost} WeTokens)',
    quickWeaveCost: 'Tejido Rápido (-{cost} WeTokens)',
    previous: 'Anterior',
    next: 'Siguiente',
    generatingTitle: 'Tejiendo tu relato...',
    generatingSubtitle: 'Gemini está creando tus capítulos y diseñando tu portada. Esto puede tardar un momento. ¡Las mejores historias merecen la pena la espera!',
    // Story Details
    startReading: 'Empezar a Leer',
    details: 'Detalles',
    synopsis: 'Sinopsis',
    universeAndLore: 'Universo y Lore',
    tags: 'Etiquetas',
    contentRating: 'Clasificación de Contenido',
    showContentWarnings: 'Mostrar Advertencias de Contenido',
    thisStoryContains: 'Esta historia contiene material que puede ser sensible para algunos lectores, incluyendo:',
    aiGeneratedNotice: 'Clasificación generada por IA. Puede no ser totalmente precisa.',
    // Story Viewer
    chapters: 'Capítulos',
    autocompleteStory: 'Autocompletar Historia',
    audiobook: 'Audiolibro',
    readMode: 'Modo Lectura',
    dialogueMode: 'Modo Diálogo',
    storyAssistant: 'Asistente de Historia',
    editMode: 'Modo Edición',
    settingsPanel: 'Ajustes',
    fontSize: 'Tamaño de Fuente',
    fontFamily: 'Familia de Fuentes',
    serif: 'Serif',
    sansSerif: 'Sans-serif',
    theme: 'Tema',
    dark: 'Oscuro',
    sepia: 'Sepia',
    light: 'Claro',
    alignment: 'Alineación',
    cancel: 'Cancelar',
    save: 'Guardar',
    autocompletingTitle: 'Terminando tu historia...',
    autocompletingSubtitle: 'Gemini está escribiendo los capítulos finales con una conclusión brillante. Esto podría tardar un momento.',
    editingChapter: 'Editando Capítulo',
    versionHistory: 'Historial de Versiones',
    restore: 'Restaurar',
    savedOn: 'Guardado el',
    noHistory: 'No hay historial de versiones para este capítulo.',
    whatIfScenario: 'Escenario "¿Qué pasaría si...?"',
    whatIfPrompt: '¿Qué pasaría si...',
    whatIfPlaceholder: 'Ej: Kael ignora el mensaje y decide retirarse a una granja.',
    generateAlternativeScene: 'Generar Escena Alternativa (-{cost} WT)',
    whatIfBenefit: 'Crear ramas de historia alternativas "¿Qué pasaría si...?"',
    // Chatbot
    chatbotGreeting: '¡Hola! Soy tu asistente de historia. Pregúntame sobre la trama o cambia a Chat de Personaje para hablar con alguien de la historia.',
    analyzeStory: 'Analizar Historia',
    characterChat: 'Chat de Personaje',
    talkTo: 'Hablar con {characterName}',
    askQuestion: 'Haz una pregunta...',
    // Auth Page
    welcomeBack: '¡Bienvenido de Nuevo!',
    loginContinue: 'Inicia sesión para continuar tu viaje.',
    joinWeaver: 'Únete a Weaver',
    createAccountPrompt: 'Crea una cuenta para empezar a tejer.',
    importAccount: 'Importar Cuenta',
    unlockAccount: 'Desbloquea tu archivo de cuenta encriptado.',
    passwordRecovery: 'Recuperación de Contraseña',
    recoverAccount: 'Vamos a ayudarte a entrar de nuevo en tu cuenta.',
    securityQuestion: 'Pregunta de Seguridad',
    verifyIdentity: 'Verifica tu identidad.',
    resetPassword: 'Restablecer Contraseña',
    chooseNewPassword: 'Elige una nueva contraseña segura.',
    name: 'Nombre',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    newPassword: 'Nueva Contraseña',
    securityAnswer: 'Respuesta de Seguridad',
    yourAnswer: 'Tu Respuesta',
    accountArchive: 'Archivo de Cuenta',
    selectBackupFile: 'Seleccionar weaver_backup.json',
    unlockAndLogin: 'Desbloquear e Iniciar Sesión',
    createAccount: 'Crear Cuenta',
    continue: 'Continuar',
    verifyAnswer: 'Verificar Respuesta',
    setNewPassword: 'Establecer Nueva Contraseña',
    login: 'Iniciar Sesión',
    forgotPassword: '¿Olvidaste la contraseña?',
    noAccount: '¿No tienes una cuenta?',
    signUp: 'Regístrate',
    haveAccount: '¿Ya tienes una cuenta?',
    loginNormally: 'Iniciar sesión normalmente',
    rememberPassword: '¿Recuerdas tu contraseña?',
    or: 'O',
    decrypting: 'Desencriptando cuenta...',
    invalidLogin: 'Correo electrónico o contraseña inválidos.',
    allFieldsRequired: 'Todos los campos son obligatorios.',
    emailExists: 'Ya existe una cuenta con este correo electrónico.',
    importFailed: 'Error al importar: Contraseña inválida o archivo corrupto.',
    noAccountForRecovery: 'No se encontró ninguna cuenta con ese correo o no tiene pregunta de seguridad configurada.',
    incorrectAnswer: 'Respuesta incorrecta. Por favor, inténtalo de nuevo.',
    passwordResetSuccess: '¡Contraseña restablecida con éxito! Por favor, inicia sesión con tu nueva contraseña.',
    genericError: 'Algo salió mal. Por favor, empieza de nuevo.',
    continueAsGuest: 'Continuar como Invitado',
     // Guide
    guideTitle: 'Guía de Weaver',
    guideSubtitle: 'Tu manual completo para dominar el arte de contar historias con Weaver y Gemini.',
    faq: 'Preguntas Frecuentes',
    gettingStarted: 'Para Empezar',
    coreFeatures: 'Funciones Principales',
    advancedFeatures: 'Funciones Avanzadas',
    economy: 'WeBucks y WeTokens',
    plansAndTiers: 'Planes y Niveles',
    contentRatingSystem: 'Entendiendo el Sistema de Clasificación',
    // Universes
    universes: 'Universos',
    crystallize: 'Cristalizar',
    crystallizeDescription: 'Analiza todas las historias de este universo con Gemini para generar una línea de tiempo, descripción y lista de personajes coherentes.',
    canon: 'Canon',
    notebook: 'Libreta',
    rules: 'Reglas del Universo',
    rulesPlaceholder: 'Ej: 1. La magia siempre requiere un sacrificio.\n2. Los viajes FTL corrompen la materia orgánica.',
    timeline: 'Línea de Tiempo',
    generateTimeline: 'Generar Línea de Tiempo con IA',
    canonicalCharacters: 'Personajes Canónicos',
    crossover: 'Crossover de Fanfic',
    crossoverDescription: '¡PLAN ULTRA: Usa Gemini para insertar a tus personajes en franquicias existentes!',
    franchise: 'Nombre de la Franquicia (ej: Star Wars, Harry Potter)',
    fetchLore: 'Obtener Lore con Búsqueda Fundamentada',
    lore: 'Lore Obtenido',
    infiltrate: 'Infiltrar Personaje',
    scenario: 'Prompt del Escenario',
    scenarioPlaceholder: 'Ej: Elara aparece durante la ceremonia del Sombrero Seleccionador.',
    generateCrossoverChapter: 'Generar Capítulo Crossover',
    generateCrossoverArt: 'Generar Arte Conceptual',
    characterSheet: 'Ficha de Personaje',
    conceptArt: 'Arte Conceptual',
    generateArt: 'Generar Arte',
    saveChanges: 'Guardar Cambios',
    universeDescription: 'Descripción del Universo',
    universeCreatedSuccess: '¡Universo "{universeName}" creado con éxito!',
    promptCreateFirstStory: '¿Te gustaría escribir la primera historia en él?',
    createStory: 'Crear Historia',
    notNow: 'Ahora No',
    // Ideas Chat
    chatTitle: 'Chat de Ideas',
    chatSubtitle: 'Tu compañero de brainstorming personal para tramas, lore y personajes.',
    chatMode: 'Modo',
    ideasGenerator: 'Generador de Ideas',
    loreConsultant: 'Consultor de Lore',
    characterRoleplay: 'Roleplay de Personaje',
    selectUniverse: 'Selecciona un Universo',
    selectCharacter: 'Selecciona un Personaje',
    chatPlaceholderIdeas: 'Ej: Necesito un giro de guion para mi historia de ciencia ficción...',
    chatPlaceholderLore: 'Ej: ¿Cómo funciona la magia en este universo?',
    chatPlaceholderCharacter: 'Ej: ¿Qué harías si te traicionaran?',
  }
};


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof locales.en, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('weaver_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('weaver_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: keyof typeof locales.en, params?: Record<string, string | number>) => {
    let str = locales[language][key] || locales.en[key];
    if (params) {
      Object.keys(params).forEach(pKey => {
        str = str.replace(`{${pKey}}`, String(params[pKey]));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// --- App Component ---

const storage = {
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem('weaver_user');
      return data ? JSON.parse(atob(data)) : null;
    } catch (e) {
      return null;
    }
  },
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('weaver_user', btoa(JSON.stringify(user)));
    } else {
      localStorage.removeItem('weaver_user');
      localStorage.removeItem('weaver_stories');
      localStorage.removeItem('weaver_universes');
    }
  },
  getStories: (): Story[] | null => {
      try {
        const data = localStorage.getItem('weaver_stories');
        return data ? JSON.parse(atob(data)) : null;
      } catch (e) {
          return null;
      }
  },
  setStories: (stories: Story[]) => {
      localStorage.setItem('weaver_stories', btoa(JSON.stringify(stories)));
  },
  getUniverses: (): Universe[] | null => {
      try {
        const data = localStorage.getItem('weaver_universes');
        return data ? JSON.parse(atob(data)) : null;
      } catch (e) {
          return null;
      }
  },
  setUniverses: (universes: Universe[]) => {
      localStorage.setItem('weaver_universes', btoa(JSON.stringify(universes)));
  },
};

const App: React.FC = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [stories, setStoriesState] = useState<Story[]>([]);
  const [universes, setUniversesState] = useState<Universe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('hub');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeUniverse, setActiveUniverse] = useState<Universe | null>(null);
  const [storyCreationUniverseId, setStoryCreationUniverseId] = useState<string | null>(null);


  useEffect(() => {
    const loggedInUser = storage.getUser();
    if (loggedInUser) {
      let loadedStories = storage.getStories();
      let loadedUniverses = storage.getUniverses();
      
      if (!loadedStories) loadedStories = [];
      if (!loadedUniverses) loadedUniverses = [];
      
      setUserState(loggedInUser);
      setStoriesState(loadedStories);
      setUniversesState(loadedUniverses);
    }
    setIsLoading(false);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    storage.setUser(newUser);
  };

  const setStories = (newStories: Story[]) => {
      setStoriesState(newStories);
      storage.setStories(newStories);
  }
  
  const setUniverses = (newUniverses: Universe[]) => {
      setUniversesState(newUniverses);
      storage.setUniverses(newUniverses);
  }

  const handleLogin = (loggedInUser: User, importedStories?: Story[]) => {
    setUser(loggedInUser);
    if (importedStories) {
      setStories(importedStories);
    } else {
      const userStories = storage.getStories() || [];
      const userUniverses = storage.getUniverses() || [];
      setStories(userStories);
      setUniverses(userUniverses);
    }
    setCurrentPage('hub');
  };

  const handleLogout = () => {
    setUser(null);
    setStories([]);
    setActiveStory(null);
    setActiveUniverse(null);
  };
  
  const addStory = (newStory: Story) => {
    const newStories = [newStory, ...stories];
    setStories(newStories);

    // If a new universe was created for this story, add it
    if (!universes.some(u => u.name === newStory.universe)) {
        addUniverse({
            id: `uni-${Date.now()}`,
            name: newStory.universe,
            description: `The universe of ${newStory.universe}.`,
            rules: [],
            timeline: '',
            storyIds: [newStory.id],
            characters: newStory.characters,
        });
    } else {
        // Otherwise, add story ID to existing universe
        const newUniverses = universes.map(u => 
            u.name === newStory.universe 
            ? { ...u, storyIds: [...u.storyIds, newStory.id] } 
            : u
        );
        setUniverses(newUniverses);
    }

    setActiveStory(newStory);
    setCurrentPage('story-details');
  };
  
  const addUniverse = (newUniverse: Universe) => {
      const newUniverses = [newUniverse, ...universes];
      setUniverses(newUniverses);
  };

  const updateStory = (updatedStory: Story) => {
      const newStories = stories.map(s => s.id === updatedStory.id ? updatedStory : s);
      setStories(newStories);
      if (activeStory?.id === updatedStory.id) {
          setActiveStory(updatedStory);
      }
  };
  
  const updateUniverse = (updatedUniverse: Universe) => {
      const newUniverses = universes.map(u => u.id === updatedUniverse.id ? updatedUniverse : u);
      setUniverses(newUniverses);
      if (activeUniverse?.id === updatedUniverse.id) {
          setActiveUniverse(updatedUniverse);
      }
  };

  const viewStory = (storyId: string) => {
      const story = stories.find(s => s.id === storyId);
      if (story) {
          setActiveStory(story);
          setCurrentPage('story-details');
      }
  };
  
  const viewUniverse = (universeId: string) => {
      const universe = universes.find(u => u.id === universeId);
      if (universe) {
          setActiveUniverse(universe);
          setCurrentPage('universe-details');
      }
  };

  const consumeWeTokens = (amount: number): boolean => {
      if (!user) return false;
      if (user.weTokens < amount) {
          alert("You don't have enough WeTokens for this action. Visit the store to get more.");
          return false;
      }
      setUser({ ...user, weTokens: user.weTokens - amount });
      return true;
  };

  const startStoryInUniverse = (universeId: string) => {
    setStoryCreationUniverseId(universeId);
    setCurrentPage('create-story');
  };

  const appContextValue = {
    user,
    setUser,
    stories,
    addStory,
    viewStory,
    updateStory,
    consumeWeTokens,
    universes,
    addUniverse,
    updateUniverse,
    viewUniverse,
    startStoryInUniverse,
  };
  
  const renderPage = () => {
    switch(currentPage) {
      case 'hub': return <Hub viewStory={viewStory} createNew={() => setCurrentPage('create-story')} />;
      case 'stories': return <Stories createNew={() => setCurrentPage('create-story')} />;
      case 'account': return <Account />;
      case 'changelog': return <Changelog />;
      case 'store': return <Store />;
      case 'guide': return <Guide />;
      case 'chat': return <Chat />;
      case 'universes': return <Universes />;
      case 'create-story': return <CreateStory initialUniverseId={storyCreationUniverseId} onCreationStarted={() => setStoryCreationUniverseId(null)} />;
      case 'story-details': return activeStory ? <StoryDetails story={activeStory} readStory={() => setCurrentPage('story-viewer')} /> : <Stories createNew={() => setCurrentPage('create-story')} />;
      case 'story-viewer': return activeStory ? <StoryViewer story={activeStory} updateStory={updateStory}/> : <Stories createNew={() => setCurrentPage('create-story')} />;
      case 'universe-details': return activeUniverse ? <UniverseDetails universe={activeUniverse} /> : <Universes />;
      default: return <Hub viewStory={viewStory} createNew={() => setCurrentPage('create-story')} />;
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner size={16} /></div>;
  }
  
  if (!user) {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex h-screen bg-gray-900 text-gray-200">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default function AppWrapper() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}