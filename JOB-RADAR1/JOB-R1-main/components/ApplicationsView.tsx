
import React from 'react';
import { Application, ApplicationStatus } from '../types';
import { motion } from 'motion/react';

interface ApplicationsViewProps {
  applications: Application[];
  showToast: (msg: string) => void;
}

const statusColors: Record<ApplicationStatus, { bg: string; darkBg: string; text: string; darkText: string; icon: string }> = {
  APPLIED: { bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', text: 'text-blue-700', darkText: 'dark:text-blue-400', icon: 'send' },
  UNDER_REVIEW: { bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: 'visibility' },
  INTERVIEW: { bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20', text: 'text-purple-700', darkText: 'dark:text-purple-400', icon: 'video_chat' },
  OFFERED: { bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20', text: 'text-emerald-700', darkText: 'dark:text-emerald-400', icon: 'celebration' },
  REJECTED: { bg: 'bg-rose-50', darkBg: 'dark:bg-rose-900/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: 'cancel' },
};

const ApplicationsView: React.FC<ApplicationsViewProps> = ({ applications, showToast }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcfb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Application Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Monitor your journey with real-time status updates.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {applications.length > 0 ? (
            applications.map((app, index) => {
              const status = statusColors[app.status];
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl ${status.bg} ${status.darkBg} flex items-center justify-center ${status.text} ${status.darkText}`}>
                      <span className="material-symbols-outlined text-3xl">{status.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{app.jobTitle}</h3>
                      <p className="text-teal-600 dark:text-teal-400 font-bold text-sm">{app.company}</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                        Applied on {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-4">
                    <div className={`px-4 py-2 rounded-xl ${status.bg} ${status.darkBg} ${status.text} ${status.darkText} text-xs font-black uppercase tracking-widest border border-current/10 flex items-center gap-2`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      {app.status.replace('_', ' ')}
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => showToast('Application details coming soon!')}
                         className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all leading-none whitespace-nowrap"
                       >
                         View Details
                       </button>
                       <button 
                         onClick={() => showToast('Connecting to employer...')}
                         className="px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 dark:shadow-none leading-none whitespace-nowrap"
                       >
                         Contact
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                <span className="material-symbols-outlined text-5xl">assignment_late</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No applications yet</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs mx-auto mb-8">
                Your career journey starts with a single application. Explore the map to find your next role.
              </p>
              <button 
                onClick={() => showToast('Explore jobs on the map!')}
                className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-600/30 hover:scale-105 transition-all"
              >
                Explore Jobs
              </button>
            </div>
          )}
        </div>

        {/* Tracking Timeline (Visual only for now) */}
        {applications.length > 0 && (
          <div className="mt-16 bg-slate-900 dark:bg-slate-900 rounded-[40px] p-10 text-white overflow-hidden relative border border-white/5 dark:border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
            <h3 className="text-2xl font-black mb-8">Hiring Velocity Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-2">Average Response</p>
                <p className="text-3xl font-black">2.4 Days</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Faster than 80% of other regions in Tamil Nadu.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-2">Interview Rate</p>
                <p className="text-3xl font-black">15%</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Based on your current skill matches.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-2">Profile Views</p>
                <p className="text-3xl font-black">48</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Employers viewed your profile this week.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsView;
