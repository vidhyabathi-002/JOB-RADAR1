
import React from 'react';
import { Job, JobCategory } from '../types';

interface SuccessScreenProps {
  job: Job;
  onClose: () => void;
  onTrack: () => void;
  showToast: (msg: string) => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ job, onClose, onTrack, showToast }) => {
  const isIT = job.category === JobCategory.IT;

  return (
    <div className="flex flex-col items-center text-center p-8 md:p-12 h-full overflow-y-auto bg-white dark:bg-slate-900">
      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 scale-110 shadow-lg shadow-emerald-100 dark:shadow-none">
        <span className="material-symbols-outlined !text-5xl font-black">check_circle</span>
      </div>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
        {isIT ? 'Application Submitted' : 'Application Sent!'}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-sm">
        You've successfully applied for the <strong className="text-slate-900 dark:text-white">{job.title}</strong> position at <strong className="text-slate-900 dark:text-white">{job.company}</strong> in {job.location.area}.
      </p>

      {isIT ? (
        /* IT Success Path */
        <div className="w-full space-y-6 mb-10">
           <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-slate-100 dark:border-slate-800">
              <div className="bg-teal-600 text-white p-2 rounded-xl"><span className="material-symbols-outlined">analytics</span></div>
              <div>
                 <p className="font-black text-sm text-slate-900 dark:text-white">Skill Review in Progress</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{job.company} is reviewing your tech profile matches.</p>
              </div>
           </div>
           <div className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-slate-100 dark:border-slate-800">
              <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 p-2 rounded-xl"><span className="material-symbols-outlined">video_call</span></div>
              <div>
                 <p className="font-black text-sm text-slate-400 dark:text-slate-500">Technical Interview</p>
                 <p className="text-xs text-slate-400 dark:text-slate-500">Scheduled upon successful screening (Usually 2-3 days).</p>
              </div>
           </div>
        </div>
      ) : (
        /* Local Success Path */
        <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-10 text-left">
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Employer Contact Info</p>
           <div className="flex items-center gap-4 mb-6">
              <div className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 p-3 rounded-2xl"><span className="material-symbols-outlined">phone</span></div>
              <div>
                 <p className="font-black text-slate-900 dark:text-white">+91 98400 XXXXX</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">Contact Person: Store Manager</p>
              </div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => showToast('Calling employer...')}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-black text-sm"
              >
                Call Now
              </button>
              <button 
                onClick={() => showToast('Opening maps...')}
                className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black text-sm"
              >
                Directions
              </button>
           </div>
        </div>
      )}

      <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-8 mt-auto">
        <h3 className="font-black text-slate-900 dark:text-white mb-4 text-left">Similar Jobs Nearby</h3>
        <div className="space-y-3">
           <div 
             onClick={() => showToast('Redirecting to similar job...')}
             className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all cursor-pointer"
           >
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl shrink-0"></div>
              <div className="text-left">
                 <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">Customer Associate</p>
                 <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Fashion Retail • OMR Hub</p>
              </div>
              <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-600">chevron_right</span>
           </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-10">
          <button 
            onClick={onTrack}
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-600/20 dark:shadow-none"
          >
            Track Application
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-900/20 dark:shadow-none"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
