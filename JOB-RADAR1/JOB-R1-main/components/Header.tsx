
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { signInWithGoogle, auth } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  role: UserRole;
  user: UserProfile | null;
  onRoleChange: (role: UserRole) => void;
  view: string;
  setView: (view: any) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showToast: (msg: string) => void;
  onToggleSidebar?: () => void;
  onCloseSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, user, onRoleChange, view, setView, darkMode, setDarkMode, showToast, onToggleSidebar, onCloseSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      showToast('Authenticated with Google pulse!', 'SUCCESS');
    } catch (e) {
      showToast('Authentication failed', 'ERROR');
    }
  };

  const handleRoleToggle = () => {
    const nextRole = role === 'JOB_SEEKER' ? 'EMPLOYER' : 'JOB_SEEKER';
    onRoleChange(nextRole);
    showToast(`Switched to ${nextRole.replace('_', ' ')} view`, 'INFO');
    setShowUserMenu(false);
  };

  return (
    <header className="absolute top-6 left-6 right-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800/50 px-6 py-3 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-50 transition-all duration-500 shine-effect group/header overflow-visible">
      {/* Decorative reflection line */ }
      <div className="absolute inset-0 glass-reflection opacity-20 dark:opacity-5 pointer-events-none" />
      
      <div 
        className="flex items-center gap-4 cursor-pointer group/logo" 
        onClick={() => {
          if (role === 'EMPLOYER') setView('EMPLOYER');
          else if (role === 'ADMIN') setView('ADMIN');
          else setView('MAP');
          onCloseSidebar?.();
        }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSidebar?.(); }}
          className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover/logo:text-teal-600 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="bg-[#0f998b] p-2.5 rounded-2xl shadow-lg shadow-[#0f998b]/30 group-hover/logo:scale-110 transition-all duration-500 radar-logo-pulse">
          <span className="material-symbols-outlined text-white text-2xl font-bold block transition-transform group-hover/logo:rotate-[360deg] duration-700">radar</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-slate-900 dark:text-white text-base font-black leading-none tracking-tight">Job Radar</h1>
          <p className="text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 animate-pulse">Chennai Hub</p>
        </div>
      </div>

      {/* Role-Based Quick Navigation (Desktop) */}
      {role !== 'GUEST' && (
        <nav className="hidden md:flex items-center gap-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1 rounded-2xl border border-white/20 dark:border-slate-700/20 shadow-sm mx-4">
          <button 
            onClick={() => setView('MAP')} 
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'MAP' ? 'bg-[#0f998b] text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Radar
          </button>
          {role === 'EMPLOYER' && (
            <>
              <button 
                onClick={() => setView('EMPLOYER')} 
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'EMPLOYER' ? 'bg-[#0f998b] text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Hub
              </button>
              <button 
                onClick={() => setView('APPLICANTS')} 
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'APPLICANTS' ? 'bg-[#0f998b] text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Applicants
              </button>
            </>
          )}
          {role === 'JOB_SEEKER' && (
            <>
              <button 
                onClick={() => setView('SAVED_JOBS')} 
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'SAVED_JOBS' ? 'bg-[#0f998b] text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Saved
              </button>
              <button 
                onClick={() => setView('PROFILE')} 
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'PROFILE' ? 'bg-[#0f998b] text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Profile
              </button>
            </>
          )}
        </nav>
      )}

      <div className="flex items-center gap-3">
        <button 
          id="theme-toggle"
          onClick={() => {
            const newVal = !darkMode;
            setDarkMode(newVal);
            showToast(newVal ? 'Midnight Radar Active' : 'Daylight Radar Active', 'INFO');
          }}
          className="w-11 h-11 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white transition-all duration-300 border border-white/50 dark:border-slate-700/50 shadow-sm group/theme active:scale-95"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-xl transition-transform group-hover/theme:rotate-90">{darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {!user ? (
          <button 
            id="login-button"
            onClick={handleLogin}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all active:scale-95 shadow-lg shadow-teal-600/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Sign In with Google
          </button>
        ) : (
          <div className="relative">
            <button 
              id="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-1.5 rounded-2xl border transition-all active:scale-95 shadow-sm group/profile ${showUserMenu ? 'border-teal-500 bg-white/60 dark:bg-teal-500/10' : 'border-white/30 dark:border-slate-700/30 hover:bg-white/60 dark:hover:bg-teal-500/10 hover:border-teal-500/30'}`}
            >
              <div className="hidden sm:flex flex-col items-end mr-3">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 leading-none uppercase tracking-widest mb-1 group-hover/profile:text-teal-600">{user.email?.split('@')[0]}</p>
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm ring-1 ring-slate-100/50 dark:ring-teal-500/20 group-hover/profile:ring-teal-500 transition-all duration-300">
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className={`material-symbols-outlined ml-2 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
                       <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                    </div>

                    <button 
                      onClick={() => { setView('PROFILE'); setShowUserMenu(false); onCloseSidebar?.(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all text-left group/item"
                    >
                      <span className="material-symbols-outlined text-lg group-hover/item:scale-110 transition-transform">account_circle</span>
                      <span className="text-sm font-bold">Manage Profile</span>
                    </button>

                    <button 
                      onClick={handleRoleToggle}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all text-left group/item"
                    >
                      <span className="material-symbols-outlined text-lg group-hover/item:rotate-180 transition-transform">swap_horiz</span>
                      <span className="text-sm font-bold">Switch to {role === 'JOB_SEEKER' ? 'Employer' : 'Seeker'}</span>
                    </button>

                    <div className="h-px bg-slate-50 dark:bg-slate-800 my-2 mx-4" />

                    <button 
                      onClick={() => { onRoleChange('GUEST'); setShowUserMenu(false); onCloseSidebar?.(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-left group/item"
                    >
                      <span className="material-symbols-outlined text-lg group-hover/item:-translate-x-1 transition-transform">logout</span>
                      <span className="text-sm font-bold">Sign Out & Exit</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
