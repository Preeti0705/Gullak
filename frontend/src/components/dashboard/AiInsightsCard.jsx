import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, AlertCircle, Info, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { aiService } from '../../services/api';

const AiInsightsCard = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.getInsights();
      setInsights(response.data.insights || []);
      setSource(response.data.source);
    } catch (err) {
      console.error('Failed to fetch AI insights', err);
      setError('Unable to load AI insights at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'danger': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'neutral': return <CheckCircle2 className="w-5 h-5 text-surface-500" />;
      default: return <Sparkles className="w-5 h-5 text-brand-500" />;
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800"></div>
          <div>
            <div className="h-5 w-32 bg-surface-200 dark:bg-surface-800 rounded mb-2"></div>
            <div className="h-3 w-48 bg-surface-200 dark:bg-surface-800 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-800 shrink-0"></div>
              <div className="space-y-2 w-full pt-1">
                <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded"></div>
                <div className="h-4 w-2/3 bg-surface-200 dark:bg-surface-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/20 dark:border-red-500/20">
        <div className="flex items-center gap-3 text-red-500 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">Insights Unavailable</h3>
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">{error}</p>
        <button 
          onClick={fetchInsights}
          className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden relative">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white">AI Financial Insights</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {source === 'gemini' ? 'Powered by Google Gemini' : 'Based on your recent activity'}
                </p>
                {source === 'gemini' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    Pro
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            className="p-2 text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Refresh Insights"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="mt-0.5 p-1.5 rounded-full bg-white dark:bg-surface-900 shadow-sm border border-surface-100 dark:border-surface-800">
                  {getIcon(insight.type)}
                </div>
                <div>
                  <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                    <span className="mr-2 text-base">{insight.icon}</span>
                    {insight.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsCard;
