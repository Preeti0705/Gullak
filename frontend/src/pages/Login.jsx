import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-brand">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">FinTrack</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome back</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">Enterprise Finance Management System</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="premium-input pl-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Password</label>
                <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-500 uppercase tracking-wider">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="premium-input pl-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="premium-button-primary w-full py-3.5 text-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-100 dark:border-surface-800 text-center">
            <p className="text-surface-500 dark:text-surface-400 text-sm">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">Create one now</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-xl text-xs font-bold text-brand-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Secure Enterprise Access
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
