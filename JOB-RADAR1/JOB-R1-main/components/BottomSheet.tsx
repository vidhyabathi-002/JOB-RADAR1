
import React, { useState, useEffect, useRef } from 'react';
import { Job, JobCategory } from '../types';

interface BottomSheetProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
  savedJobIds: string[];
  selectedJobId?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ jobs, onSelectJob, onToggleSave, savedJobIds, selectedJobId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedJobId) {
      setIsExpanded(true);
      // Wait for expansion animation
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selectedJobId]);

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 z-[1100] bg-white dark:bg-slate-900 transition-all duration-500 rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.1)] dark:shadow-none flex flex-col border-t border-slate-100 dark:border-slate-800 ${
        isExpanded ? 'h-[60vh]' : 'h-16 md:h-20'
      }`}
    >
      <div 
        className="flex flex-col items-center py-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-1 group-hover:bg-teal-500 transition-colors" />
        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] group-hover:text-teal-600 transition-colors">
          {isExpanded ? 'Collapse Radar List' : `${jobs.length} Priority Jobs Found`}
        </p>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-6 pb-8 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {jobs.map(job => (
            <div 
              key={job.id} 
              ref={selectedJobId === job.id ? activeItemRef : null}
              onClick={() => onSelectJob(job)}
              className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden group/card ${
                selectedJobId === job.id 
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-xl shadow-teal-500/5 ring-1 ring-teal-500' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-teal-200 dark:hover:border-teal-900/50 hover:shadow-lg'
              }`}
            >
              {selectedJobId === job.id && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-bl-[4rem] flex items-start justify-end p-4">
                   <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 font-bold">check_circle</span>
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                    job.category === JobCategory.IT 
                      ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400' 
                      : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
                  }`}>
                    {job.category}
                  </span>
                  {job.urgent && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded animate-pulse leading-none">
                      <span className="material-symbols-outlined text-xs leading-none">emergency</span> 
                      <span className="leading-none">Urgent</span>
                    </span>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }}
                  className={`p-1 transition-colors ${savedJobIds.includes(job.id) ? 'text-rose-500' : 'text-slate-300 dark:text-slate-500 hover:text-rose-400 dark:hover:text-rose-400'}`}
                >
                  <span className={`material-symbols-outlined text-sm ${savedJobIds.includes(job.id) ? 'filled-icon' : ''}`}>
                    {savedJobIds.includes(job.id) ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{job.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{job.company} • {job.location.area}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800 mt-auto gap-2">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 leading-none">{job.salary}</span>
                <button 
                  className="bg-slate-900 dark:bg-teal-600 text-white text-[9px] px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-teal-500 transition-all active:scale-95 leading-none whitespace-nowrap"
                  onClick={(e) => { e.stopPropagation(); onSelectJob(job); }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
