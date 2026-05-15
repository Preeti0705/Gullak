import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
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
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create your account</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">Join the enterprise financial network</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="premium-input pl-12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Password</label>
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
              <p className="text-[10px] text-surface-500 mt-2 uppercase tracking-wider font-bold">Min. 6 characters with bank-grade encryption</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="premium-button-primary w-full py-3.5 text-lg flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-100 dark:border-surface-800 text-center">
            <p className="text-surface-500 dark:text-surface-400 text-sm">
              Already have an account? {' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500">Sign in instead</Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-surface-400 leading-relaxed px-10">
          By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
