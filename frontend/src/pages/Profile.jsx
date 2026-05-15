import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Camera, 
  Shield, 
  Key, 
  Save, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD',
    monthlyBudget: user?.monthlyBudget || 0
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await profileService.updateProfile(formData);
      updateUserInfo(response.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setPasswordLoading(true);
    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const response = await profileService.uploadAvatar(formData);
      updateUserInfo({ avatar: response.avatar });
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Profile Management</h1>
        <p className="text-surface-500 dark:text-surface-400">Manage your identity and account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-600 to-indigo-600" />
            <div className="relative z-10 pt-4">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-surface-900 p-1.5 shadow-xl mx-auto overflow-hidden">
                   <div className="w-full h-full rounded-[2rem] bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 text-4xl font-black overflow-hidden relative">
                     {user?.avatar ? (
                       <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                       user?.name?.charAt(0).toUpperCase()
                     )}
                     {uploadingAvatar && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <Loader2 className="w-8 h-8 text-white animate-spin" />
                       </div>
                     )}
                   </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-900 hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                />
              </div>
              
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white mt-6">{user?.name}</h2>
              <p className="text-surface-500 font-medium">{user?.email}</p>
              
              <div className="flex justify-center gap-2 mt-4">
                <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-900/30">
                  Verified Enterprise
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800">
                <p className="text-[10px] font-bold text-surface-400 uppercase mb-1">Currency</p>
                <p className="font-bold text-surface-900 dark:text-white">{user?.currency || 'USD'}</p>
              </div>
              <div className="p-4 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800">
                <p className="text-[10px] font-bold text-surface-400 uppercase mb-1">Joined</p>
                <p className="font-bold text-surface-900 dark:text-white">{user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
               <Shield className="w-5 h-5 text-brand-600" /> Security Status
             </h3>
             <div className="space-y-4">
               <StatusItem icon={CheckCircle} label="Two-Factor Auth" active={false} color="text-slate-400" />
               <StatusItem icon={CheckCircle} label="Biometric Access" active={true} color="text-emerald-500" />
               <StatusItem icon={CheckCircle} label="Active Sessions" active={1} color="text-brand-500" />
             </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-8 flex items-center gap-3">
              <User className="text-brand-600" /> General Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input 
                      type="text" 
                      className="premium-input pl-11"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input 
                      type="email" 
                      className="premium-input pl-11 bg-surface-50 dark:bg-surface-900/50 cursor-not-allowed"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Primary Currency</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <select 
                      className="premium-input pl-11"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Total Monthly Budget ($)</label>
                  <input 
                    type="number" 
                    className="premium-input"
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({...formData, monthlyBudget: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="premium-button-primary px-8 py-3 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-8 flex items-center gap-3">
              <Key className="text-brand-600" /> Security Credentials
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    required
                    className="premium-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">New Password</label>
                  <input 
                    type="password" 
                    required
                    className="premium-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    className="premium-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="premium-button-secondary px-8 py-3 flex items-center gap-2"
                >
                  {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ icon: Icon, label, active, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{label}</span>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-slate-400'}`}>
      {typeof active === 'boolean' ? (active ? 'Enabled' : 'Disabled') : active}
    </span>
  </div>
);

export default Profile;
