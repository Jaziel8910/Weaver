import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { plans, missions } from '../constants';
import type { Plan, Mission } from '../types';
import { Gem, CheckCircle, ShoppingCart, Target } from 'lucide-react';
import { useTranslation } from '../App';

const Store: React.FC = () => {
    const { user, setUser, stories } = useContext(AppContext);
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'plans' | 'missions'>('plans');
    const [duration, setDuration] = useState(30); // 30, 90, 180 days

    if (!user) return null;

    const getPrice = (plan: Plan) => {
        if (!plan.price) return { finalPrice: 0, discount: 0 };
        const basePrice = plan.price.weBucks;
        let finalPrice = basePrice;
        let discount = 0;
        if (duration === 90) {
            finalPrice = basePrice * 2.5; // 16.6% discount
            discount = 17;
        } else if (duration === 180) {
            finalPrice = basePrice * 4.5; // 25% discount
            discount = 25;
        }
        return { finalPrice, discount };
    }

    const handleBuyPlan = (plan: Plan) => {
        const { finalPrice } = getPrice(plan);
        if (user.weBucks < finalPrice) {
            alert("You don't have enough WeBucks!");
            return;
        }

        const newExpiry = Date.now() + duration * 24 * 60 * 60 * 1000;
        
        const updatedUser = {
            ...user,
            weBucks: user.weBucks - finalPrice,
            plan: {
                tier: plan.name,
                expires: newExpiry,
            }
        };
        setUser(updatedUser);
        alert(`Successfully purchased ${plan.name} for ${duration} days!`);
    };
    
    const handleClaimMission = (mission: Mission) => {
        const updatedUser = {
            ...user,
            weBucks: user.weBucks + mission.reward
        };
        // In a real app, you'd also mark the mission as claimed in the user's data
        setUser(updatedUser);
    }

    return (
        <div className="p-8 h-full">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('storeTitle')}</h1>
                    <p className="text-gray-400 mt-2">{t('storeSubtitle')}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                    <Gem size={24} className="text-cyan-400 mr-3"/>
                    <span className="text-2xl font-bold text-white">{user.weBucks.toLocaleString()}</span>
                </div>
            </header>

            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('plans')} className={`${activeTab === 'plans' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-white'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                       <ShoppingCart size={20} className="mr-2"/> {t('plans')}
                    </button>
                    <button onClick={() => setActiveTab('missions')} className={`${activeTab === 'missions' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400 hover:text-white'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                       <Target size={20} className="mr-2"/> {t('missions')}
                    </button>
                </nav>
            </div>
            
            {activeTab === 'plans' && (
                <div className="animate-fade-in">
                    <div className="max-w-md mx-auto mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2 text-center">{t('selectPlanDuration')}</label>
                        <div className="grid grid-cols-3 gap-2 bg-gray-700 p-1 rounded-lg">
                             <button onClick={() => setDuration(30)} className={`py-2 rounded-md text-sm ${duration === 30 ? 'bg-primary-500 text-white' : 'hover:bg-gray-600'}`}>30 {t('days')}</button>
                             <button onClick={() => setDuration(90)} className={`py-2 rounded-md text-sm ${duration === 90 ? 'bg-primary-500 text-white' : 'hover:bg-gray-600'}`}>90 {t('days')}</button>
                             <button onClick={() => setDuration(180)} className={`py-2 rounded-md text-sm ${duration === 180 ? 'bg-primary-500 text-white' : 'hover:bg-gray-600'}`}>180 {t('days')}</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {plans.filter(p => p.name !== 'Free').map(plan => {
                            const { finalPrice, discount } = getPrice(plan);
                            return (
                                <div key={plan.name} className={`rounded-lg p-6 border-2 flex flex-col ${user.plan.tier === plan.name ? 'border-green-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50'} relative`}>
                                    {discount > 0 && <div className="absolute top-0 right-4 -mt-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">{discount}% {t('discountOff')}</div>}
                                    <div className="flex items-center mb-4">
                                        {plan.icon}
                                        <h3 className="text-2xl font-bold ml-3">{plan.name}</h3>
                                        {user.plan.tier === plan.name && <span className="ml-auto text-xs font-semibold bg-green-500 text-white px-2 py-1 rounded-full">{t('currentlyActive').toUpperCase()}</span>}
                                    </div>
                                    <ul className="space-y-2 text-gray-400 flex-grow">
                                        {plan.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start">
                                                <svg className="w-4 h-4 mr-2 mt-1 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-6 text-center">
                                        <p className="text-4xl font-bold text-white">{finalPrice.toLocaleString()} WB</p>
                                        <p className="text-gray-400">{t('forDuration', { duration })}</p>
                                        <button onClick={() => handleBuyPlan(plan)} disabled={user.plan.tier === plan.name} className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                                            {user.plan.tier === plan.name ? t('currentlyActive') : t('purchasePlan')}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'missions' && (
                <div className="space-y-4 animate-fade-in">
                    {missions.map(mission => {
                        const isCompleted = mission.isCompleted(user, stories);
                        const isClaimed = false; 
                        return (
                            <div key={mission.id} className={`p-4 rounded-lg flex items-center ${isCompleted ? 'bg-gray-700' : 'bg-gray-800 border border-gray-700'}`}>
                                <div className={`p-3 rounded-full mr-4 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}>
                                    {isCompleted ? <CheckCircle size={24} className="text-white"/> : <Target size={24} className="text-white"/>}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-white">{mission.title}</h4>
                                    <p className="text-sm text-gray-400">{mission.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-cyan-400 flex items-center justify-end">
                                        <Gem size={16} className="mr-1"/> +{mission.reward}
                                    </p>
                                     {isCompleted ? (
                                        <button onClick={() => handleClaimMission(mission)} disabled={isClaimed} className="mt-1 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed">
                                            {isClaimed ? t('claimed') : t('claimReward')}
                                        </button>
                                     ) : (
                                        <p className="text-xs text-gray-500 mt-1">{t('incomplete')}</p>
                                     )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Store;
