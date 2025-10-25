import React, { useContext, useRef } from 'react';
import type { Plan, User, Story } from '../types';
import { AppContext } from '../contexts/AppContext';
import { plans } from '../constants';
import { Gem, Zap } from 'lucide-react';
import { useTranslation } from '../App';
import { encrypt } from '../services/cryptoService';


const TierCard: React.FC<{plan: Plan; isActive: boolean;}> = ({plan, isActive}) => {
    const { t } = useTranslation();
    return (
    <div className={`rounded-lg p-6 border-2 ${isActive ? 'border-primary-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'}`}>
        <div className="flex items-center mb-4">
            {plan.icon}
            <h3 className="text-2xl font-bold ml-3">{plan.name}</h3>
        </div>
        <ul className="space-y-2 text-gray-400">
            {plan.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>{benefit}</span>
                </li>
            ))}
        </ul>
        {plan.name !== 'Free' && !isActive && (
             <button className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg">
                {t('upgradeInStore')}
             </button>
        )}
    </div>
)};


const Account: React.FC = () => {
    const { user, setUser, stories } = useContext(AppContext);
    const { t, language, setLanguage } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;
    
    const getPlanExpiry = () => {
        if (user.plan.tier === 'Free' || !user.plan.expires) return t('never');
        return new Date(user.plan.expires).toLocaleDateString();
    }
    
    const handleExport = async () => {
        const password = prompt("Please enter your account password to encrypt your backup file:");
        if (!password) {
            alert("Export cancelled. Password is required.");
            return;
        }

        try {
            // 1. Prepare data for export, stripping sensitive info
            const accountDataToExport = { ...user };
            delete accountDataToExport.password;
            delete accountDataToExport.securityQuestion;
            delete accountDataToExport.securityAnswer;
            
            // 2. Encrypt account data and stories data separately
            const encryptedAccountData = await encrypt(JSON.stringify(accountDataToExport), password);
            const encryptedStoriesData = await encrypt(JSON.stringify(stories), password);

            // 3. Create the backup object
            const backupData = {
                version: '1.0',
                encryptedData: {
                    account: encryptedAccountData,
                    stories: encryptedStoriesData,
                }
            };
            
            // 4. Create and trigger download
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "weaver_backup.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            alert("Account archive exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export account data. Your password may be incorrect.");
        }
    };
    
    // The import is now handled on the AuthPage
    const handleImportClick = () => {
       alert(t('importTooltip'));
    };
    
    const getNextTokenRefresh = () => {
        const plan = plans.find(p => p.name === user.plan.tier);
        if (!plan || !plan.weTokenRefreshDays) return 'N/A';
        const nextRefreshDate = new Date(user.lastWeTokenRefresh + plan.weTokenRefreshDays * 24 * 60 * 60 * 1000);
        return nextRefreshDate.toLocaleString();
    }


  return (
    <div className="p-8 h-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">{t('account')}</h1>
        <p className="text-gray-400 mt-2">{t('manageProfile')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary-500"/>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-primary-500 font-semibold">{user.plan.tier} {t('tier')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('planExpires')}: {getPlanExpiry()}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                 <div>
                    <h3 className="font-bold text-xl mb-2 text-white flex items-center">
                        <Gem size={20} className="text-cyan-400 mr-2"/>
                        {t('weBucksBalance')}
                    </h3>
                    <div className="text-4xl font-bold text-cyan-400">{user.weBucks.toLocaleString()}</div>
                    <p className="text-gray-400 text-sm mt-1">{t('earnMoreInStore')}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl mb-2 text-white flex items-center">
                        <Zap size={20} className="text-yellow-400 mr-2"/>
                        {t('weTokensBalance')}
                    </h3>
                    <div className="text-4xl font-bold text-yellow-400">{user.weTokens.toLocaleString()}</div>
                    <p className="text-gray-400 text-sm mt-1">{t('nextRefresh')}: {getNextTokenRefresh()}</p>
                </div>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <h3 className="font-bold text-xl mb-4 text-white">{t('settings')}</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('language')}</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'es')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-200 mb-2">{t('accountData')}</h4>
                    <div className="flex gap-4">
                         <button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{t('exportData')}</button>
                         <button onClick={handleImportClick} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed" title={t('importTooltip')}>{t('importData')}</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-6 text-white">{t('membershipTiers')}</h3>
            <div className="space-y-6">
                {plans.map(p => <TierCard key={p.name} plan={p} isActive={user.plan.tier === p.name} />)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
