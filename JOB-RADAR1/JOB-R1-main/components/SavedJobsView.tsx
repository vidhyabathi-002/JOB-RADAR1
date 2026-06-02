import React from 'react';
import { Job } from '../types';
import { motion } from 'motion/react';

interface SavedJobsViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onRemove: (jobId: string) => void;
  showToast: (msg: string) => void;
}

const SavedJobsView: React.FC<SavedJobsViewProps> = ({ jobs, onSelectJob, onRemove, showToast }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcfb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Saved Opportunities</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Your curated list of potential career moves.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</span>
            <span className="text-lg font-black text-teal-600 dark:text-teal-400">{jobs.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none group hover:border-teal-500 dark:hover:border-teal-500 transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
                    <img src={`https://picsum.photos/seed/${job.company}/100/100`} className="object-contain" alt="Logo" referrerPolicy="no-referrer" />
                  </div>
                  <button 
                    onClick={() => onRemove(job.id)}
                    className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <span className="material-symbols-outlined filled-icon">favorite</span>
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{job.title}</h3>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mb-6">{job.company} • {job.location.area}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(job.skills_required || []).slice(0, 2).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800 gap-4 mt-auto">
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400 leading-none whitespace-nowrap">{job.salary}</span>
                  <button 
                    onClick={() => onSelectJob(job)}
                    className="px-8 py-3 bg-slate-900 dark:bg-teal-600 text-white dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-lg shadow-slate-900/20 dark:shadow-none leading-none whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl">favorite_border</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs mx-auto mb-8">
                Found something interesting? Tap the heart icon on any job to save it for later.
              </p>
              <button 
                onClick={() => showToast('Explore jobs on the map!')}
                className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/30 hover:scale-105 transition-all"
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobsView;
