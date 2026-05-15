import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  BarChart3, 
  PieChart, 
  Layers, 
  Zap, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Fin<span className="text-brand-600">Track</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Solutions</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors">Sign in</Link>
            <Link to="/register" className="premium-button-primary flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold uppercase tracking-wider mb-8">
              <Zap className="w-3 h-3 fill-brand-600" />
              Revolutionizing Personal Finance
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              The next-generation <br />
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">finance platform</span> for elites.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience enterprise-grade expense management, AI-driven insights, and sophisticated financial planning in one seamless interface.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                Start your journey <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Image / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-3xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-950 p-4">
              <div className="bg-slate-900 rounded-2xl aspect-[16/9] flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=2000" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 hidden lg:block bg-white p-6 rounded-2xl shadow-premium border border-slate-100 w-64"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Monthly Savings</p>
                  <p className="text-lg font-bold text-slate-900">+$2,450.00</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[75%]" />
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 -left-10 hidden lg:block bg-white p-6 rounded-2xl shadow-premium border border-slate-100 w-64"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Budget Spent</p>
                  <p className="text-lg font-bold text-slate-900">$1,280.50</p>
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>USAGE</span>
                <span>64%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-[64%]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted by modern professionals at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale transition-all">
             {['Google', 'Microsoft', 'Goldman Sachs', 'Stripe', 'Airbnb'].map(brand => (
               <span key={brand} className="text-2xl font-bold tracking-tight text-slate-900">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">Everything you need to master your wealth.</h2>
            <p className="text-lg text-slate-600">FinTrack provides a comprehensive suite of tools designed for precision, clarity, and security.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Deep dive into your spending patterns with interactive charts and granular breakdowns."
              },
              {
                icon: Layers,
                title: "Budget Intelligence",
                desc: "Set smart budgets that adapt to your lifestyle and provide real-time alerts."
              },
              {
                icon: ShieldCheck,
                title: "Bank-Grade Security",
                desc: "Your data is encrypted with state-of-the-art protocols and never shared."
              },
              {
                icon: Zap,
                title: "AI Financial Coach",
                desc: "Receive personalized insights and suggestions to optimize your savings."
              },
              {
                icon: PieChart,
                title: "Visual Reporting",
                desc: "Beautiful, exportable PDF and CSV reports for your accounting needs."
              },
              {
                icon: ChevronRight,
                title: "Mobile Optimized",
                desc: "Manage your finances on the go with our fully responsive web experience."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-premium transition-all group">
                <div className="w-14 h-14 bg-slate-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to take control of <br /> your financial future?</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">Join thousands of software engineers and corporate leaders who manage their wealth with FinTrack.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-all shadow-xl">
                Get started for free
              </Link>
              <a href="https://github.com" className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-semibold hover:text-brand-400 transition-colors">
                <ShieldCheck className="w-6 h-6" /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
          </div>
          
          <div className="flex gap-10">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Privacy</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Terms</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Cookie Policy</a>
          </div>

          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} FinTrack Enterprise Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
