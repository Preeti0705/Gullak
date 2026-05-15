import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  PieChart, 
  Bell, 
  Settings, 
  LogOut, 
  ShieldCheck,
  CreditCard,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Budgets', path: '/budgets', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
                Fin<span className="text-brand-600">Track</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  "nav-link",
                  isActive && "nav-link-active"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile Summary */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-900">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-bold overflow-hidden border border-brand-200 dark:border-brand-800">
                {user?.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="mt-4 flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
