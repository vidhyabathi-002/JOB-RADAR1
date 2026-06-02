
import React, { useState } from 'react';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../services/firebase';

interface LandingPageProps {
  onLogin: (role: UserRole, email: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [step, setStep] = useState<'CREDENTIALS' | 'ROLE' | 'FORGOT_PASSWORD'>('CREDENTIALS');
  const [resetSent, setResetSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('JOB_SEEKER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('role', selectedRole);
      await signInWithGoogle();
      // App.tsx handles state via onAuthStateChanged
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Google login failed');
    }
  };

  const roles: { id: UserRole; title: string; desc: string; icon: string; color: string; features: string[]; premium?: boolean }[] = [
    { 
      id: 'JOB_SEEKER', 
      title: 'Job Seeker', 
      desc: 'Find local opportunities and IT roles near you.', 
      icon: 'person_search',
      color: 'bg-teal-500',
      features: ['Real-time Map', 'Instant Apply', 'Skill Matching'],
      premium: true
    },
    { 
      id: 'EMPLOYER', 
      title: 'Employer', 
      desc: 'Post jobs and find the best talent for your team.', 
      icon: 'business_center',
      color: 'bg-indigo-500',
      features: ['Unlimited Posts', 'Talent Search', 'Analytics'],
      premium: true
    },
    { 
      id: 'ADMIN', 
      title: 'Administrator', 
      desc: 'Manage the platform, monitor jobs, and oversee operations.', 
      icon: 'admin_panel_settings',
      color: 'bg-slate-700',
      features: ['System Control', 'User Management', 'Audit Logs']
    }
  ];

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (authMode === 'SIGN_UP') {
        if (!name) {
          setErrorMsg('Please enter your full name.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password should be at least 6 characters.');
          return;
        }
        await registerWithEmail(email, password, name, selectedRole);
        // App.tsx handles state via onAuthStateChanged
        setShowLoginModal(false);
      } else {
        localStorage.setItem('role', selectedRole); // Fallback role 
        await loginWithEmail(email, password);
        // App.tsx onAuthStateChanged picks it up
      }
    } catch (err: any) {
      console.error('Credential Error:', err);
      // Clean up firebase error strings
      let cleanMsg = err.message.replace('Firebase:', '').trim();
      if (cleanMsg.includes('auth/operation-not-allowed')) {
        cleanMsg = 'Email/Password Authentication is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.';
      }
      setErrorMsg(cleanMsg);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setStep('CREDENTIALS');
      }, 3000);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('CREDENTIALS');
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-8 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
            <span className="material-symbols-outlined text-white">radar</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">JOB RADAR</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button 
            onClick={() => { setShowLoginModal(true); setAuthMode('SIGN_IN'); setStep('ROLE'); }}
            className="px-6 py-2.5 bg-slate-900 dark:bg-teal-600 text-white rounded-full font-bold text-sm hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/10 dark:shadow-teal-600/20"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative px-6 md:px-12 pt-12 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400">Tamil Nadu Regional Hub</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
              FIND YOUR <br />
              <span className="text-teal-600 dark:text-teal-400">NEXT MOVE</span> <br />
              ON THE MAP.
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mb-10 font-medium leading-relaxed">
              A real-time, location-aware job discovery platform. Unifying local micro-employment and professional IT positions across Tamil Nadu.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => { setShowLoginModal(true); setAuthMode('SIGN_UP'); setStep('ROLE'); }}
                className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black text-lg hover:bg-teal-700 transition-all shadow-2xl shadow-teal-600/30 flex items-center gap-3"
              >
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="pl-6">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Joined by 10k+ users</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Across Tamil Nadu</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative group transition-colors duration-300">
              <img 
                src="https://picsum.photos/seed/city/800/800" 
                className="w-full h-full object-cover opacity-90 dark:opacity-70 group-hover:scale-105 transition-transform duration-700"
                alt="Job Map"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-slate-950/60 to-transparent"></div>
              
              {/* Floating UI Elements */}
              <div className="absolute top-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 max-w-[200px] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Urgent Role</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Warehouse Helper</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Downtown • $22/hr</p>
              </div>

              <div className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 max-w-[200px] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">code</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">IT Position</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">React Developer</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tech Park • $120k PA</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden transition-colors duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1 bg-slate-900 dark:bg-slate-950 p-10 text-white flex flex-col justify-between transition-colors duration-300">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">
                      {step === 'FORGOT_PASSWORD' ? 'Reset access.' : authMode === 'SIGN_IN' ? 'Welcome back.' : step === 'ROLE' ? 'Join the ecosystem.' : 'Create your account.'}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
                      {step === 'FORGOT_PASSWORD'
                        ? 'We will send a secure link to your email to recover your account.'
                        : authMode === 'SIGN_IN' 
                          ? 'Sign in with your credentials to access your personalized job radar.' 
                          : step === 'ROLE' 
                            ? 'Select your pathway to get started with Job Radar.'
                            : `Setting up your ${selectedRole.replace('_', ' ').toLowerCase()} profile.`}
                    </p>
                  </div>
                  <div className="mt-12 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-3">Why go Premium?</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                          <span className="material-symbols-outlined text-xs text-teal-500">check_circle</span>
                          Priority Job Matching
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                          <span className="material-symbols-outlined text-xs text-teal-500">check_circle</span>
                          Advanced Map Filters
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                          <span className="material-symbols-outlined text-xs text-teal-500">check_circle</span>
                          Direct Employer Chat
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                          <span className="material-symbols-outlined text-xs text-teal-500">check_circle</span>
                          Live Job Locations
                        </li>
                        <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                          <span className="material-symbols-outlined text-xs text-teal-500">check_circle</span>
                          Micro-Job Opportunities
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-teal-400">verified</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Secure Access</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-600">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 p-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                  {step === 'FORGOT_PASSWORD' ? (
                    <div className="h-full flex flex-col justify-center">
                      {resetSent ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-4"
                        >
                          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">Check your inbox.</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">We've sent a recovery link to <span className="text-slate-900 dark:text-white font-bold">{email}</span></p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-4">Redirecting to login...</p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleForgotSubmit} className="space-y-6">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input 
                              type="email" 
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                              placeholder="alex@example.com"
                            />
                          </div>
                          <button 
                            type="submit"
                            className="w-full py-4 bg-slate-900 dark:bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 dark:shadow-teal-600/20"
                          >
                            Send Reset Link
                          </button>
                          <button 
                            type="button"
                            onClick={() => setStep('CREDENTIALS')}
                            className="w-full text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to login
                          </button>
                        </form>
                      )}
                    </div>
                  ) : step === 'CREDENTIALS' ? (
                    <form onSubmit={handleCredentialSubmit} className="space-y-6">
                      {errorMsg && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                          {errorMsg}
                        </div>
                      )}
                      {authMode === 'SIGN_UP' && (
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                            placeholder="Alex Doe"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                          placeholder="alex@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Password</label>
                        <input 
                          type="password" 
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-white dark:placeholder-slate-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-4 bg-slate-900 dark:bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 dark:shadow-teal-600/20"
                      >
                        {authMode === 'SIGN_IN' ? 'Sign In' : 'Create Account'}
                      </button>

                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or pulse in with</span>
                        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-3"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                      </button>
                      <div className="text-center flex flex-col gap-4">
                        <button 
                          type="button" 
                          onClick={() => setStep('FORGOT_PASSWORD')}
                          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                        >
                          Forgot password?
                        </button>
                        {authMode === 'SIGN_UP' && (
                          <button 
                            type="button"
                            onClick={() => setStep('ROLE')}
                            className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Change role
                          </button>
                        )}
                        {authMode === 'SIGN_IN' && (
                          <button 
                            type="button"
                            onClick={() => { setAuthMode('SIGN_UP'); setStep('ROLE'); }}
                            className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                          >
                            Don't have an account? <span className="text-teal-600 dark:text-teal-400">Sign Up</span>
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="grid gap-4">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className="group relative flex items-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/5 transition-all text-left"
                        >
                          {role.premium && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-200 dark:border-amber-800">
                              Premium
                            </div>
                          )}
                          <div className={`w-14 h-14 ${role.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                            <span className="material-symbols-outlined text-2xl">{role.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{role.title}</h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{role.desc}</p>
                            <div className="flex flex-wrap gap-2">
                              {role.features.map((f, idx) => (
                                <span key={idx} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors">chevron_right</span>
                        </button>
                      ))}
                      <button 
                        onClick={() => { setAuthMode('SIGN_IN'); setStep('CREDENTIALS'); }}
                        className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                      >
                        Already have an account? <span className="text-teal-600 dark:text-teal-400">Sign In</span>
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    className="mt-8 w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Go back to home
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
