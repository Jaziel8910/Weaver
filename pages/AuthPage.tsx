import React, { useState, useRef } from 'react';
import type { User, Story } from '../types';
import { Feather } from 'lucide-react';
import { initialStories, plans } from '../constants';
import { decrypt } from '../services/cryptoService';
import Spinner from '../components/Spinner';
import { useTranslation } from '../App';

interface AuthPageProps {
  onLoginSuccess: (user: User, stories?: Story[]) => void;
}

const userDB = {
  getUsers: (): { [email: string]: User } => {
    try {
      const data = localStorage.getItem('weaver_users_db');
      return data ? JSON.parse(atob(data)) : {};
    } catch (e) {
      return {};
    }
  },
  saveUsers: (users: { [email: string]: User }) => {
    localStorage.setItem('weaver_users_db', btoa(JSON.stringify(users)));
  }
};

type AuthView = 'login' | 'signup' | 'import' | 'forgot_password_email' | 'forgot_password_question' | 'forgot_password_reset';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState("What was your first pet's name?");
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userForRecovery, setUserForRecovery] = useState<User | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = userDB.getUsers();
    const user = users[email];
    if (user && user.password === password) {
      // Stories for existing users are loaded in the main App component from their separate storage
      onLoginSuccess(user);
    } else {
      setError(t('invalidLogin'));
    }
  };
  
  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!name || !email || !password || !securityQuestion || !securityAnswer) {
          setError(t('allFieldsRequired'));
          return;
      }
      const users = userDB.getUsers();
      if (users[email]) {
        setError(t('emailExists'));
        return;
      }
      const freePlan = plans.find(p => p.name === 'Free')!;
      const newUser: User = {
        name,
        email,
        password,
        securityQuestion,
        securityAnswer,
        avatarUrl: `https://picsum.photos/seed/${name}/100/100`,
        weBucks: 500,
        weTokens: freePlan.weTokenAllowance,
        lastWeTokenRefresh: Date.now(),
        plan: { tier: 'Free' },
        inventory: { themes: [], features: [] },
      };
      users[email] = newUser;
      userDB.saveUsers(users);
      onLoginSuccess(newUser, []); // Pass empty stories array for new user
  };

  const handleImport = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!importedFile || !password) {
          setError("Please select a file and enter the password.");
          return;
      }
      setIsLoading(true);
      setError('');
      try {
          const fileContent = await importedFile.text();
          const backupData = JSON.parse(fileContent);
          
          if (!backupData.version || !backupData.encryptedData.account || !backupData.encryptedData.stories) {
              throw new Error("Invalid backup file format.");
          }
          
          const decryptedAccountJson = await decrypt(backupData.encryptedData.account, password);
          const decryptedStoriesJson = await decrypt(backupData.encryptedData.stories, password);

          const importedUser = JSON.parse(decryptedAccountJson) as User;
          const importedStories = JSON.parse(decryptedStoriesJson) as Story[];
          
          // Add the imported user to our user database so they can log in normally next time
          const users = userDB.getUsers();
          // We need to store the password they just used to unlock the file
          importedUser.password = password; 
          users[importedUser.email] = importedUser;
          userDB.saveUsers(users);

          onLoginSuccess(importedUser, importedStories);

      } catch (error) {
          setError(t('importFailed'));
      } finally {
          setIsLoading(false);
      }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const users = userDB.getUsers();
      const user = users[email];
      if (user && user.securityQuestion) {
          setUserForRecovery(user);
          setView('forgot_password_question');
      } else {
          setError(t('noAccountForRecovery'));
      }
  };
  
  const handleSecurityQuestion = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (userForRecovery && securityAnswer.toLowerCase() === userForRecovery.securityAnswer?.toLowerCase()) {
          setView('forgot_password_reset');
      } else {
          setError(t('incorrectAnswer'));
      }
  };
  
  const handlePasswordReset = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!userForRecovery || !newPassword) {
          setError(t('genericError'));
          return;
      }
      const users = userDB.getUsers();
      const userToUpdate = users[userForRecovery.email];
      if (userToUpdate) {
          userToUpdate.password = newPassword;
          userDB.saveUsers(users);
          alert(t('passwordResetSuccess'));
          setView('login');
          setPassword('');
          setNewPassword('');
          setUserForRecovery(null);
      } else {
          setError("Could not find user to update.");
      }
  };

  const handleGuestLogin = () => {
    const freePlan = plans.find(p => p.name === 'Free')!;
    const guestUser: User = {
      name: 'Guest',
      email: `guest-${Date.now()}@weaver.app`,
      isGuest: true,
      avatarUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=guest`,
      weBucks: 250,
      weTokens: freePlan.weTokenAllowance,
      lastWeTokenRefresh: Date.now(),
      plan: { tier: 'Free' },
      inventory: { themes: [], features: [] },
    };
    onLoginSuccess(guestUser, initialStories);
  };


  const renderContent = () => {
      if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center h-48">
                <Spinner size={12}/>
                <p className="mt-4 text-gray-300">{t('decrypting')}</p>
            </div>
          );
      }
      switch (view) {
          case 'signup':
              return (
                  <form className="space-y-4" onSubmit={handleSignup}>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('name')}</label>
                          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required/>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('securityQuestion')}</label>
                          <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required>
                              <option>What was your first pet's name?</option>
                              <option>What is your mother's maiden name?</option>
                              <option>What city were you born in?</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('securityAnswer')}</label>
                          <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required/>
                      </div>
                      <button type="submit" className="w-full py-3 btn-primary">{t('createAccount')}</button>
                  </form>
              );
          case 'import':
              return (
                  <form className="space-y-6" onSubmit={handleImport}>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('accountArchive')}</label>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-left bg-gray-700 border border-gray-600 rounded-lg p-3 truncate">
                            {importedFile ? importedFile.name : t('selectBackupFile')}
                          </button>
                          <input type="file" ref={fileInputRef} onChange={e => setImportedFile(e.target.files?.[0] || null)} className="hidden" accept=".json" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" placeholder={t('password')}/>
                      </div>
                      <button type="submit" className="w-full py-3 btn-primary">{t('unlockAndLogin')}</button>
                  </form>
              );
          case 'forgot_password_email':
                return (
                    <form className="space-y-6" onSubmit={handleForgotPassword}>
                        <p className="text-sm text-gray-400">Enter your email address to begin the recovery process.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required />
                        </div>
                        <button type="submit" className="w-full py-3 btn-primary">{t('continue')}</button>
                    </form>
                );
          case 'forgot_password_question':
                return (
                    <form className="space-y-6" onSubmit={handleSecurityQuestion}>
                        <p className="text-sm text-gray-400">Answer your security question to continue.</p>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm text-gray-300 font-medium">{userForRecovery?.securityQuestion}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('yourAnswer')}</label>
                            <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required />
                        </div>
                        <button type="submit" className="w-full py-3 btn-primary">{t('verifyAnswer')}</button>
                    </form>
                );
          case 'forgot_password_reset':
                 return (
                    <form className="space-y-6" onSubmit={handlePasswordReset}>
                         <p className="text-sm text-gray-400">Create a new password for your account.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t('newPassword')}</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" required />
                        </div>
                        <button type="submit" className="w-full py-3 btn-primary">{t('setNewPassword')}</button>
                    </form>
                );
          case 'login':
          default:
              return (
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3"/>
                         <div className="text-right mt-2">
                             <button type="button" onClick={() => { setView('forgot_password_email'); setError(''); }} className="text-xs font-medium text-primary-500 hover:text-primary-400">{t('forgotPassword')}</button>
                         </div>
                    </div>
                    <button type="submit" className="w-full py-3 btn-primary">{t('login')}</button>
                </form>
            );
      }
  };

  const getTitle = (): [string, string] => {
      const titles: Record<AuthView, [string, string]> = {
          login: [t('welcomeBack'), t('loginContinue')],
          signup: [t('joinWeaver'), t('createAccountPrompt')],
          import: [t('importAccount'), t('unlockAccount')],
          forgot_password_email: [t('passwordRecovery'), t('recoverAccount')],
          forgot_password_question: [t('securityQuestion'), t('verifyIdentity')],
          forgot_password_reset: [t('resetPassword'), t('chooseNewPassword')],
      };
      return titles[view];
  };

  const [title, subtitle] = getTitle();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
      <style>{`.btn-primary { padding: 0.75rem 1rem; border-radius: 0.5rem; background-color: #8b5cf6; color: white; font-weight: 500; } .btn-primary:hover { background-color: #7c3aed; }`}</style>
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <Feather className="text-primary-500" size={32} />
                <h1 className="ml-3 text-3xl font-bold text-white">Weaver</h1>
            </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-gray-400">{subtitle}</p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
        {renderContent()}

        <p className="text-center text-sm text-gray-400">
          {view === 'login' && <>{t('noAccount')} <button onClick={() => { setView('signup'); setError(''); }} className="link">{t('signUp')}</button></>}
          {view === 'signup' && <>{t('haveAccount')} <button onClick={() => { setView('login'); setError(''); }} className="link">{t('login')}</button></>}
          {view === 'import' && <>{t('or')}, <button onClick={() => { setView('login'); setError(''); }} className="link">{t('loginNormally')}</button></>}
          {(view === 'forgot_password_email' || view === 'forgot_password_question' || view === 'forgot_password_reset') && <>{t('rememberPassword')} <button onClick={() => { setView('login'); setError(''); }} className="link">{t('login')}</button></>}
        </p>
         {view === 'login' && (
             <div className="space-y-4">
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-600"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-800 px-2 text-gray-500">{t('or')}</span></div>
                 </div>
                 <button onClick={handleGuestLogin} className="w-full py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg">{t('continueAsGuest')}</button>
                 <button onClick={() => { setView('import'); setError(''); }} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg">{t('importAccount')}</button>
             </div>
         )}
      </div>
    </div>
  );
};

export default AuthPage;