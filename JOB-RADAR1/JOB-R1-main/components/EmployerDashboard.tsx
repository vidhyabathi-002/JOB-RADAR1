
import React from 'react';
import { Job } from '../types';

interface EmployerDashboardProps {
  jobs: Job[];
  user: any;
  onNavigate: (view: any, data?: any) => void;
  onUpdateStatus: (jobId: string, status: 'OPEN' | 'CLOSED') => void;
  onDeleteJob: (jobId: string) => void;
  showToast: (msg: string) => void;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ jobs, user, onNavigate, onUpdateStatus, onDeleteJob, showToast }) => {
  const employerJobs = jobs.filter(j => 
    j.employerId === user?.id
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f9fafb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Radar</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Managing Chennai's top talent pools in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigate('ALERTS')}
              className="flex items-center gap-3 px-8 py-5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-[28px] font-black border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 uppercase tracking-widest text-xs relative"
            >
              <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-amber-50 dark:border-slate-900 animate-pulse" />
              <span className="material-symbols-outlined font-black">notifications_active</span>
              Smart Alerts
            </button>
            <button 
              onClick={() => onNavigate('ANALYTICS')}
              className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-[28px] font-black border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              <span className="material-symbols-outlined font-black">analytics</span>
              Analytics
            </button>
            <button 
              onClick={() => onNavigate('POST_JOB')}
              className="flex items-center gap-3 px-10 py-5 bg-[#0f998b] text-white rounded-[28px] font-black shadow-2xl shadow-[#0f998b]/30 hover:scale-[1.03] transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              <span className="material-symbols-outlined font-black">add_circle</span>
              Broadcast Role
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Live Slots</span>
              <span className="material-symbols-outlined text-[#0f998b]">work</span>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">{employerJobs.length}</p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">{employerJobs.filter(j => j.status === 'OPEN').length} Active</p>
          </div>
          <div onClick={() => onNavigate('APPLICANTS')} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Leads</span>
              <span className="material-symbols-outlined text-[#0f998b]">groups</span>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white">86</p>
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> 14 Unread
            </p>
          </div>
          <div 
            onClick={() => onNavigate('MAP')}
            className="bg-teal-900 dark:bg-teal-950 p-8 rounded-[40px] shadow-2xl shadow-teal-900/20 lg:col-span-2 relative overflow-hidden text-white transition-colors duration-300 cursor-pointer hover:scale-[1.01] transition-all group/coverage"
          >
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase text-teal-300 dark:text-teal-400 tracking-widest mb-4 block">Global Coverage</span>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
                <p className="text-2xl font-black">Active near Marina</p>
              </div>
              <p className="text-teal-100/70 dark:text-teal-200/50 text-sm font-medium">Visible to 842 local seekers today.</p>
              
              <div className="mt-4 flex items-center gap-2 text-teal-300 text-[10px] font-black uppercase tracking-widest group-hover/coverage:gap-3 transition-all">
                <span>View Real-time Map</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 group-hover/coverage:scale-110 transition-transform text-white">
              <span className="material-symbols-outlined !text-[160px]">radar</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">Broadcast History</h2>
           <button onClick={() => onNavigate('APPLICANTS')} className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest hover:underline">View All Candidates</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {employerJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img src={`https://picsum.photos/seed/${job.id}/800/400`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" alt="Job Background" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-slate-950/90 to-transparent" />
                <div className="absolute top-6 left-8 flex gap-2">
                  <div className="bg-white/20 dark:bg-slate-800/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{job.category}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-[0.2em] ${
                    job.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    job.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {job.status === 'PENDING' ? 'WAITING FOR ADMIN' : job.status}
                  </div>
                </div>
                
                <div className="absolute top-6 right-8 flex gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onNavigate('POST_JOB', job); }}
                     className="size-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white flex items-center justify-center transition-all active:scale-90"
                   >
                     <span className="material-symbols-outlined text-lg">edit</span>
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
                     className="size-10 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md rounded-xl text-rose-400 flex items-center justify-center transition-all active:scale-90"
                   >
                     <span className="material-symbols-outlined text-lg">delete</span>
                   </button>
                </div>

                <div className="absolute bottom-6 left-8">
                  <h3 className="text-2xl font-black text-white leading-tight">{job.title}</h3>
                  <p className="text-white/60 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {job.location.area} • {job.salary}
                  </p>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-5 rounded-[28px] text-center border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">Engagements</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">1.2k</p>
                  </div>
                  <div className="flex-1 bg-teal-50 dark:bg-teal-900/20 p-5 rounded-[28px] text-center border border-teal-100 dark:border-teal-900/30 transition-colors duration-300">
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-black uppercase mb-1">Match Rate</p>
                    <p className="text-xl font-black text-teal-700 dark:text-teal-300">84%</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onNavigate('APPLICANTS')} className="flex-1 py-4.5 bg-slate-900 dark:bg-teal-600 text-white font-black rounded-[24px] text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-teal-500 transition-all active:scale-95">Manage Applicants</button>
                  <button 
                    onClick={() => job.status !== 'PENDING' && job.status !== 'REJECTED' && onUpdateStatus(job.id, job.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                    disabled={job.status === 'PENDING' || job.status === 'REJECTED'}
                    className={`px-7 py-4.5 rounded-[24px] font-black transition-all flex items-center justify-center gap-2 border ${
                      job.status === 'PENDING' || job.status === 'REJECTED' ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed' :
                      job.status === 'OPEN' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 
                      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{job.status === 'PENDING' ? 'hourglass_empty' : job.status === 'REJECTED' ? 'warning' : job.status === 'OPEN' ? 'block' : 'check_circle'}</span>
                    <span className="text-[10px] uppercase tracking-widest font-black leading-none">{job.status === 'PENDING' ? 'Awaiting' : job.status === 'REJECTED' ? 'Blocked' : job.status === 'OPEN' ? 'Pause' : 'Resume'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {employerJobs.length === 0 && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[44px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
               <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                 <span className="material-symbols-outlined text-4xl">radar</span>
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Radar is currently silent</h2>
               <p className="text-slate-500 font-bold max-w-xs mb-8">You haven't broadcasted any roles yet. Start hiring top talent near your hubs.</p>
               <button onClick={() => onNavigate('POST_JOB')} className="bg-[#0f998b] text-white px-10 py-4.5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0f998b]/20">Broadcast First Role</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
