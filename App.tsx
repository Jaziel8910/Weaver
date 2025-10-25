import React, { useState, useCallback, useMemo, useEffect, createContext, useContext } from 'react';
import { Page, Story, User, Language, Plan } from './types';
import { initialStories, plans } from './constants';
import Sidebar from './components/Sidebar';
import Hub from './pages/Hub';
import Stories from './pages/Stories';
import Account from './pages/Account';
import Changelog from './pages/Changelog';
import CreateStory from './pages/CreateStory';
import StoryViewer from './pages/StoryViewer';
import Store from './pages/Store';
import AuthPage from './pages/AuthPage';
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
    createNewStory: 'Create New Story',
    logout: 'Log Out',
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
    importData: 'Import Data',
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
    universeNamePlaceholder: 'e.g., Star Wars, Middle-earth, or your own',
    isExistingUniverse: 'This is an existing universe.',
    fetchUniverseInfo: 'Fetch Universe Info',
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
    previous: 'Previous',
    next: 'Next',
    generatingTitle: 'Weaving your tale...',
    generatingSubtitle: 'Gemini is crafting your chapters and designing your cover. This may take a moment. The best stories are worth the wait!',
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
    createNewStory: 'Crear Nueva Historia',
    logout: 'Cerrar Sesión',
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
    universeNamePlaceholder: 'Ej: Star Wars, Tierra Media, o el tuyo propio',
    isExistingUniverse: 'Este es un universo existente.',
    fetchUniverseInfo: 'Obtener Información del Universo',
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
    previous: 'Anterior',
    next: 'Siguiente',
    generatingTitle: 'Tejiendo tu relato...',
    generatingSubtitle: 'Gemini está creando tus capítulos y diseñando tu portada. Esto puede tardar un momento. ¡Las mejores historias merecen la pena la espera!',
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
  }
};


const App: React.FC = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('hub');
  const [stories, setStoriesState] = useState<Story[]>(initialStories);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  
  const setStories = (newStories: Story[]) => {
      setStoriesState(newStories);
      if (user) { // Only save stories if a user is logged in
          storage.setStories(newStories);
      }
  };

  useEffect(() => {
    let loggedInUser = storage.getUser();
    if (loggedInUser) {
      const now = Date.now();
      // Check for expired plans
      if (loggedInUser.plan.expires && loggedInUser.plan.expires < now) {
        loggedInUser.plan = { tier: 'Free' };
      }

      // Check for WeToken refresh
      const userPlanDetails = plans.find(p => p.name === loggedInUser.plan.tier);
      if (userPlanDetails && userPlanDetails.weTokenRefreshDays) {
          const refreshInterval = userPlanDetails.weTokenRefreshDays * 24 * 60 * 60 * 1000;
          if (now - loggedInUser.lastWeTokenRefresh > refreshInterval) {
              loggedInUser = {
                  ...loggedInUser,
                  weTokens: (loggedInUser.weTokens || 0) + userPlanDetails.weTokenAllowance,
                  lastWeTokenRefresh: now
              };
          }
      }
      
      const userStories = storage.getStories();
      if (userStories) {
          setStoriesState(userStories);
      } else {
          // If no stories are in storage for this user, use the initial ones (for demo)
          setStoriesState(initialStories);
          storage.setStories(initialStories);
      }
      
      storage.setUser(loggedInUser);
      setUserState(loggedInUser);
    }
    setIsLoading(false);
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    storage.setUser(user);
  };
  
  const handleLoginSuccess = (loggedInUser: User, importedStories?: Story[]) => {
      setUser(loggedInUser);
      if (importedStories) {
          setStories(importedStories); // Set and save imported stories
      } else {
          // For regular login, load their saved stories or default ones
          const userStories = storage.getStories();
          setStoriesState(userStories || initialStories);
      }
  };
  
  const consumeWeTokens = (amount: number): boolean => {
      if (user && user.weTokens >= amount) {
          setUser({ ...user, weTokens: user.weTokens - amount });
          return true;
      }
      alert("You don't have enough WeTokens for this action!");
      return false;
  };

  const addStory = (newStory: Story) => {
    const newStories = [newStory, ...stories];
    setStories(newStories);
    setActiveStoryId(newStory.id);
    setCurrentPage('story-viewer');
    if (user && stories.length === 0) {
        setUser({ ...user, weBucks: user.weBucks + 150 });
    }
  };
  
  const updateStory = (updatedStory: Story) => {
    const newStories = stories.map(story => story.id === updatedStory.id ? updatedStory : story)
    setStories(newStories);
  };

  const viewStory = (storyId: string) => {
    setActiveStoryId(storyId);
    setCurrentPage('story-viewer');
  };

  const handleLogout = () => {
    setUser(null);
    // Also clear their stories from state to show defaults for next login
    setStoriesState(initialStories); 
    setCurrentPage('hub');
  };

  const renderPage = useCallback(() => {
    const activeStory = stories.find(s => s.id === activeStoryId);
    switch (currentPage) {
      case 'hub':
        return <Hub viewStory={viewStory} createNew={() => setCurrentPage('create-story')} />;
      case 'stories':
        return <Stories createNew={() => setCurrentPage('create-story')} />;
      case 'account':
        return <Account />;
      case 'changelog':
        return <Changelog />;
       case 'store':
        return <Store />;
      case 'create-story':
        return <CreateStory />;
      case 'story-viewer':
        return activeStory ? <StoryViewer story={activeStory} updateStory={updateStory} /> : <Hub viewStory={viewStory} createNew={() => setCurrentPage('create-story')} />;
      default:
        return <Hub viewStory={viewStory} createNew={() => setCurrentPage('create-story')} />;
    }
  }, [currentPage, stories, activeStoryId]);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    stories,
    addStory,
    viewStory,
    updateStory,
    consumeWeTokens,
  }), [user, stories]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <Spinner size={16} />
        </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
            <main className="flex-1 overflow-y-auto">
            {renderPage()}
            </main>
        </div>
    </AppContext.Provider>
  );
};


const AppWrapper: React.FC = () => (
    <LanguageProvider>
        <App />
    </LanguageProvider>
);

export default AppWrapper;