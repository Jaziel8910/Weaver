import React, { useContext } from 'react';
import type { Page } from '../types';
import { Home, BookOpen, User, GitBranch, Feather, ShoppingCart, LogOut } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../App';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  const { user } = useContext(AppContext);
  const { t } = useTranslation();

  const navItems = [
    { id: 'hub', label: t('hub'), icon: <Home size={20} /> },
    { id: 'stories', label: t('myStories'), icon: <BookOpen size={20} /> },
    { id: 'store', label: t('store'), icon: <ShoppingCart size={20} /> },
    { id: 'account', label: t('account'), icon: <User size={20} /> },
    { id: 'changelog', label: t('changelog'), icon: <GitBranch size={20} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-8 px-2">
          <Feather className="text-primary-500" size={28} />
          <h1 className="ml-2 text-2xl font-bold text-white">Weaver</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={currentPage === item.id}
              onClick={() => setCurrentPage(item.id as Page)}
            />
          ))}
        </nav>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={() => setCurrentPage('create-story')}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-105"
        >
          <Feather size={20} className="mr-2" />
          {t('createNewStory')}
        </button>

        <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center px-2">
                <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.plan.tier} {t('tier')}</p>
                </div>
                 <button onClick={onLogout} className="ml-auto text-gray-400 hover:text-white p-2" aria-label={t('logout')}>
                    <LogOut size={20}/>
                </button>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
