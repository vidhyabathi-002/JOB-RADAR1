import React, { useEffect, useState } from 'react';
import { generateEmployerAlerts } from '../services/geminiService';
import { Job } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EmployerAlertsViewProps {
  jobs: Job[];
  user: any;
  showToast: (msg: string) => void;
}

const EmployerAlertsView: React.FC<EmployerAlertsViewProps> = ({ jobs, user, showToast }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const employerJobs = jobs.filter(j => 
    j.employerId === user?.id || 
    j.company === 'Global Tech OMR' || 
    j.company === 'Sree Krishna Sweets'
  );

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const aiAlerts = await generateEmployerAlerts(employerJobs);
      setAlerts(aiAlerts);
      setLoading(false);
    };
    if (employerJobs.length > 0) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [jobs]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcfb] dark:bg-slate-950 transition-colors duration-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Active Hiring Alerts</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Real-time signals on your candidate pipeline and market conditions in Chennai.</p>
          </div>
          <button 
            onClick={() => { setAlerts([]); showToast('Alerts cleared'); }}
            className="text-xs font-black text-rose-600 dark:text-rose-400 hover:opacity-80 flex items-center gap-1 uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span> Clear All
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center p-12"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Scanning Talent Pipelines...</p>
                </div>
              </motion.div>
            ) : alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-[32px] text-center"
              >
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-4">notifications_off</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Active Alerts</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Your hiring pipeline is stable. We'll notify you if market conditions shift.</p>
              </motion.div>
            ) : (
              alerts.map((alert, index) => (
                <motion.div 
                  key={alert.id || index} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className={`group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all flex flex-col h-full ${alert.type === 'warning' ? 'border-amber-200 dark:border-amber-900/50' : ''}`}
                >
                  <div className="flex gap-6">
                    <div className={`shrink-0 size-14 rounded-2xl flex items-center justify-center ${
                      alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                      alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">
                        {alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'check_circle' : 'campaign'}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{alert.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{alert.message}</p>
                    </div>
                    <div className="flex items-center">
                       <button onClick={() => showToast('Alert acknowledged')} className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                          <span className="material-symbols-outlined">done</span>
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmployerAlertsView;
