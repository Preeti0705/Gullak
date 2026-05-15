import React from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Cpu,
  Monitor,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Settings = () => {
  const { theme, toggleTheme } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">System Settings</h1>
        <p className="text-surface-500 dark:text-surface-400">Configure platform experience and data preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings */}
        <div className="md:col-span-1 space-y-2">
           <SettingsNavItem icon={Monitor} label="Appearance" active={true} />
           <SettingsNavItem icon={Bell} label="Notifications" />
           <SettingsNavItem icon={Globe} label="Localization" />
           <SettingsNavItem icon={Shield} label="Privacy & Security" />
           <SettingsNavItem icon={Database} label="Data Management" />
           <SettingsNavItem icon={Cpu} label="Developer API" />
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Appearance Section */}
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-600" /> Visual Interface
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900/50 rounded-2xl border border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 shadow-sm flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900 dark:text-white">Theme Preference</p>
                    <p className="text-xs text-surface-500">Current: {theme === 'dark' ? 'Modern Dark' : 'Enterprise Light'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="px-6 py-2 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-brand hover:scale-105 transition-all"
                >
                  Switch Theme
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Motion & Animations</p>
                  <p className="text-xs text-surface-500">Enable premium interface transitions</p>
                </div>
                <Toggle active={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Compact Sidebar</p>
                  <p className="text-xs text-surface-500">Maximize workspace area</p>
                </div>
                <Toggle active={false} />
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600" /> Alert Subscriptions
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Weekly Summaries</p>
                  <p className="text-xs text-surface-500">Receive financial reports every Monday</p>
                </div>
                <Toggle active={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Budget Critical Alerts</p>
                  <p className="text-xs text-surface-500">Instant notification when usage exceeds 90%</p>
                </div>
                <Toggle active={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-white">Anomaly Detection</p>
                  <p className="text-xs text-surface-500">Alert me of unusual spending patterns</p>
                </div>
                <Toggle active={true} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20">
             <div className="flex items-start gap-4">
               <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600">
                 <Shield className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Danger Zone</h4>
                 <p className="text-xs text-rose-800/70 dark:text-rose-400/70 mt-1">
                   Permanent deletion of your financial account and all associated transaction logs. This action cannot be reversed.
                 </p>
                 <button className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all">
                   Terminate Account
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsNavItem = ({ icon: Icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
    active ? 'bg-brand-600 text-white shadow-brand' : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900'
  }`}>
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

const Toggle = ({ active }) => (
  <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-brand-600' : 'bg-surface-200 dark:bg-surface-800'}`}>
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
  </div>
);

export default Settings;
