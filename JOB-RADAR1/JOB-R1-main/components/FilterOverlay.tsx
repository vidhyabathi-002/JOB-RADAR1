
import React from 'react';
import { JobCategory } from '../types';

interface FilterOverlayProps {
  filters: any;
  setFilters: (f: any) => void;
  onClose: () => void;
  userLocation: string;
}

const FilterOverlay: React.FC<FilterOverlayProps> = ({ filters, setFilters, onClose, userLocation }) => {
  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Search & Filters</h1>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600">search</span>
              <input 
                autoFocus
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white dark:placeholder-slate-500" 
                placeholder="Job Title, Skills, or Company"
                value={filters.query}
                onChange={(e) => setFilters({...filters, query: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-2xl border border-teal-100 dark:border-teal-800">
               <span className="material-symbols-outlined text-teal-600">location_on</span>
               <span className="text-sm font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">{userLocation}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Job Category</h3>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button 
                onClick={() => setFilters({...filters, category: 'ALL'})}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filters.category === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-md text-teal-700 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
              >All Jobs</button>
              <button 
                onClick={() => setFilters({...filters, category: JobCategory.LOCAL})}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filters.category === JobCategory.LOCAL ? 'bg-white dark:bg-slate-700 shadow-md text-teal-700 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
              >Local</button>
              <button 
                onClick={() => setFilters({...filters, category: JobCategory.IT})}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${filters.category === JobCategory.IT ? 'bg-white dark:bg-slate-700 shadow-md text-teal-700 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
              >IT Tech</button>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Search Radius</h3>
                <span className="bg-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{filters.radius} km</span>
             </div>
             <input 
               type="range" min="1" max="500" step="1" 
               value={filters.radius} onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
               className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
             />
             <div className="flex justify-between mt-3 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
               <span>1km</span><span>100km</span><span>250km</span><span>500km</span>
             </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl">
             <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 animate-pulse">emergency</span>
               <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm">Urgent Hiring Only</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Fast-track local positions</p>
               </div>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input 
                 type="checkbox" checked={filters.urgentOnly} 
                 onChange={(e) => setFilters({...filters, urgentOnly: e.target.checked})}
                 className="sr-only peer" 
               />
               <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
             </label>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <button 
            onClick={() => setFilters({ query: '', radius: 50, category: 'ALL', urgentOnly: false })}
            className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
          >Clear All</button>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Cancel</button>
             <button onClick={onClose} className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-600/20">Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterOverlay;
