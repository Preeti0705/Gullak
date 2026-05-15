import React from 'react';
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-20 px-6 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-surface-600 dark:text-surface-400 lg:hidden hover:bg-surface-100 dark:hover:bg-surface-900 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-900 rounded-xl transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          className="relative p-2.5 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-900 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-surface-950"></span>
        </button>

        <div className="h-8 w-[1px] bg-surface-200 dark:bg-surface-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-surface-900 dark:text-white leading-none">{user?.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider font-medium">Enterprise</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-brand group-hover:scale-105 transition-transform overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
