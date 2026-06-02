
import React from 'react';
import { MOCK_ALERTS } from '../constants';

interface AlertsViewProps {
  onSelectJob: (job: any) => void;
  showToast: (msg: string) => void;
}

const AlertsView: React.FC<AlertsViewProps> = ({ onSelectJob, showToast }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcfb] dark:bg-slate-950 transition-colors duration-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Chennai Seeker Alerts</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Targeted job signals for Madhavaram, Sholinganallur, and nearby hubs.</p>
          </div>
          <button 
            onClick={() => showToast('Alerts cleared')}
            className="text-xs font-black text-rose-600 dark:text-rose-400 hover:opacity-80 flex items-center gap-1 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span> Clear All
          </button>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 filled-icon">emergency</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Urgent Nearby</h3>
            </div>
            <div className="space-y-4">
              {MOCK_ALERTS.filter(a => a.type === 'URGENT').map(alert => (
                <div key={alert.id} className="relative group bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                  <div className="absolute top-6 right-6 w-3 h-3 bg-rose-600 dark:bg-rose-500 rounded-full animate-pulse" />
                  <div className="flex gap-6">
                    <div className="shrink-0 size-14 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-xl text-slate-900 dark:text-white">{alert.title}</h4>
                        <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 px-3 py-1 rounded-full uppercase tracking-widest">{alert.distance}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6">{alert.company} Hub • Immediate Joining • {alert.salary}</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onSelectJob(alert)}
                          className="bg-rose-600 text-white text-xs font-black px-8 py-3 rounded-2xl shadow-xl shadow-rose-600/20 dark:shadow-none hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                        >
                          Apply Now
                        </button>
                        <button 
                          onClick={() => showToast('Shared with your network!')}
                          className="p-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined">share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 filled-icon">stars</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">High Skill Match</h3>
            </div>
            <div className="space-y-4">
              {MOCK_ALERTS.filter(a => a.type === 'MATCH').map(alert => (
                <div key={alert.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                  <div className="flex gap-6">
                    <div className="shrink-0 size-14 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-black text-xl text-slate-900 dark:text-white">{alert.title}</h4>
                          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{alert.company} OMR Park</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">94%</span>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">AI Match</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span> {alert.salary} • Hybrid
                      </p>
                      <div className="flex items-center gap-3 mt-auto">
                        <button 
                          onClick={() => onSelectJob(alert)}
                          className="bg-slate-900 dark:bg-teal-600 text-white dark:text-white text-[10px] font-black px-8 py-3 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-none hover:bg-slate-800 dark:hover:bg-teal-500 active:scale-95 transition-all uppercase tracking-widest leading-none whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => showToast('Added to favorites!')}
                          className="p-3 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        >
                          <span className="material-symbols-outlined leading-none">favorite</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AlertsView;
