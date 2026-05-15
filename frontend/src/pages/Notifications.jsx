import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  ShieldCheck,
  Loader2,
  MoreVertical,
  CheckCheck
} from 'lucide-react';
import { notificationService } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'budget_alert': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'budget_exceeded': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'insight': return <TrendingUp className="w-5 h-5 text-brand-500" />;
      case 'system': return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Notifications</h1>
          <p className="text-surface-500 dark:text-surface-400">Stay updated on your financial milestones</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="premium-button-secondary flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-surface-500 font-medium">Synchronizing alerts...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div 
                key={n._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-5 flex gap-5 group transition-all duration-300 ${
                  !n.isRead ? 'border-l-4 border-l-brand-600 bg-brand-50/10 dark:bg-brand-900/5' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                  !n.isRead ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-surface-100 dark:bg-surface-800'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-bold ${!n.isRead ? 'text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-400'}`}>
                        {n.title}
                      </h3>
                      <p className={`text-sm mt-1 leading-relaxed ${!n.isRead ? 'text-surface-700 dark:text-surface-300' : 'text-surface-500'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] font-bold text-surface-400 mt-3 uppercase tracking-widest">
                        {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(n._id)}
                          className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(n._id)}
                        className="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card p-20 text-center">
          <div className="w-20 h-20 bg-surface-50 dark:bg-surface-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-surface-200" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Inbox Zero</h2>
          <p className="text-surface-500 mt-2 max-w-sm mx-auto">
            You're all caught up! There are no notifications or alerts for you right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
