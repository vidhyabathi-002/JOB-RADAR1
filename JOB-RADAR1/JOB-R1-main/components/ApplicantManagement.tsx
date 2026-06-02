
import React from 'react';
import { MOCK_APPLICANTS } from '../constants';

interface ApplicantManagementProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const ApplicantManagement: React.FC<ApplicantManagementProps> = ({ onBack, showToast }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#f9fafb] dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Candidate Queue</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">search</span>
              <input 
                className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold w-64 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors" 
                placeholder="Search by name or area..." 
                onChange={() => showToast('Search functionality coming soon!')}
              />
           </div>
           <button 
             onClick={() => showToast('Listing shared!')}
             className="bg-teal-600 dark:bg-teal-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 dark:shadow-teal-500/20"
           >
             Share Listing
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MOCK_APPLICANTS.map(app => (
              <div key={app.id} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <img src={app.avatar} className="size-14 rounded-2xl object-cover shadow-md" alt={app.name} referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{app.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{app.jobTitle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    app.status === 'NEW' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>{app.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl transition-colors">
                      <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Proximity</p>
                      <p className="text-base font-black text-slate-900 dark:text-white">{app.distance}</p>
                   </div>
                   <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-2xl transition-colors">
                      <p className="text-[9px] font-black text-teal-400 dark:text-teal-500 uppercase tracking-widest mb-1">AI Match</p>
                      <p className="text-base font-black text-teal-700 dark:text-teal-400">{app.matchScore}%</p>
                   </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl p-4 mb-8">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[14px] text-indigo-500">auto_awesome</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Recruiter AI Summary</p>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic">
                    "Candidate shows strong alignment with core requirements. High retention probability based on transit distance and local hub preference."
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => showToast(`Calling ${app.name}...`)}
                    className="px-4 py-3.5 bg-teal-600 dark:bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 dark:shadow-teal-500/20 active:scale-95 transition-all"
                  >
                    Call
                  </button>
                  <button 
                    onClick={() => showToast(`Interview invite sent to ${app.name}!`)}
                    className="flex-1 py-3.5 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    Schedule
                  </button>
                  <button 
                    onClick={() => showToast(`Opening resume for ${app.name}...`)}
                    className="px-4 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-100 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined">description</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantManagement;
