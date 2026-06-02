import React, { useState } from 'react';

interface AdminSettingsProps {
  user: any;
  onBack: () => void;
  showToast: (msg: string, type?: 'SUCCESS' | 'ERROR') => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, onBack, showToast }) => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Admin preferences successfully updated', 'SUCCESS');
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-10 space-y-12">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <button onClick={onBack} className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">System Settings</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Admin Profile & AI Oversight Preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm text-center flex flex-col items-center">
               <div className="w-32 h-32 rounded-[24px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-6 relative">
                 <img src={user?.avatar || `https://ui-avatars.com/api/?name=Admin&background=0f998b&color=fff`} className="w-full h-full object-cover" alt="Admin Badge" />
                 <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-sm py-1">
                   <p className="text-[10px] font-black tracking-widest uppercase text-white">Verified</p>
                 </div>
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">{user?.name || 'Administrator'}</h3>
               <p className="text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mt-1">Level 5 Clearance</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30">
               <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                 <span className="material-symbols-outlined shrink-0 text-3xl">verified_user</span>
                 <p className="font-black text-sm uppercase tracking-widest leading-tight">Master Control Node</p>
               </div>
               <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-400/60 leading-relaxed mt-3">
                 Changes made here affect systemic variables for Chennai's primary job routing algorithms.
               </p>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 dark:border-slate-800 pb-4">Identity Credentials</h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Display Name</label>
                   <input type="text" defaultValue={user?.name || 'System Admin'} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 transition-colors" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">System Account ID</label>
                   <input type="email" defaultValue={user?.email || 'admin@chennairadar.ai'} readOnly className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold text-slate-500 dark:text-slate-600 outline-none cursor-not-allowed transition-colors" />
                 </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-50 dark:border-slate-800 pb-4">AI Moderation Preferences</h3>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-black text-slate-900 dark:text-white">Auto-Reject High Toxicity</p>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Uses Gemini to flag and route severe spam.</p>
                   </div>
                   <div className="w-14 h-8 bg-teal-500 rounded-full flex items-center p-1 cursor-pointer shadow-inner">
                     <div className="w-6 h-6 bg-white rounded-full translate-x-6 shadow-sm" />
                   </div>
                 </div>

                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-black text-slate-900 dark:text-white">Email Moderation Alerts</p>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Notify me daily of pending moderation tasks.</p>
                   </div>
                   <div className="w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center p-1 cursor-pointer shadow-inner">
                     <div className="w-6 h-6 bg-white dark:bg-slate-400 rounded-full shadow-sm" />
                   </div>
                 </div>
               </div>
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full py-5 bg-teal-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-teal-500 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-600/20 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">save</span>}
              {loading ? 'Committing...' : 'Commit Settings to Core'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
