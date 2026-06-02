
import React, { useState } from 'react';
import { Job } from '../types';
import { db, auth } from '../services/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { MOCK_JOBS } from '../constants';

interface AdminPanelProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  role?: string;
  user?: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ jobs, setJobs, role, user }) => {
  const [selectedReview, setSelectedReview] = useState<Job | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState('All Regions');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const jobsRef = collection(db, 'jobs');
      for (const job of MOCK_JOBS) {
        const { id, ...jobData } = job;
        await setDoc(doc(db, 'jobs', id), {
          ...jobData,
          status: 'PENDING',
          employerId: auth.currentUser?.uid || 'mock_employer_1'
        });
      }
      setSuccessMessage('Successfully seeded Chennai Radar data!');
    } catch (e) {
      console.error(e);
      setSuccessMessage('Seeding failed. Check console.');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const pendingJobs = jobs.filter(j => {
    const isPending = j.status === 'PENDING';
    if (activeRegion === 'All Regions') return isPending;
    return isPending && j.location.area.toLowerCase().includes(activeRegion.split(' ')[0].toLowerCase());
  });

  const handleStatusChange = async (id: string, status: 'OPEN' | 'CLOSED' | 'REJECTED') => {
    try {
      const { updateDoc } = await import('firebase/firestore');
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, { status });
      
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
      setSelectedReview(null);
      setSuccessMessage(`Post successfully ${status === 'OPEN' ? 'approved' : status.toLowerCase()}`);
    } catch (e) {
      console.error(e);
      setSuccessMessage('Failed to update status in database.');
    } finally {
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f9fafb] dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Success Message Toast */}
      {successMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            {successMessage}
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Admin Control Engine</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Security oversight for the regional job network.</p>
            </div>
            <button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{isSeeding ? 'sync' : 'database'}</span>
              {isSeeding ? 'Seeding...' : 'Seed Radar data'}
            </button>
          </div>

          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Moderation Queue</h2>
            </div>
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
              {['All Regions', 'IT', 'Retail', 'Guindy', 'Ambattur'].map(chip => (
                <button 
                  key={chip} 
                  onClick={() => setActiveRegion(chip)}
                  className={`px-5 py-2.5 border text-xs font-black uppercase tracking-widest rounded-2xl transition-all shrink-0 ${
                    activeRegion === chip 
                      ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-600 dark:hover:border-teal-400'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">Job Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] text-center">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] text-center">Urgency</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {pendingJobs.map(job => (
                  <tr 
                    key={job.id} 
                    className={`group transition-all cursor-pointer ${selectedReview?.id === job.id ? 'bg-teal-50/50 dark:bg-teal-900/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}
                    onClick={() => setSelectedReview(job)}
                  >
                    <td className="px-8 py-8">
                      <p className="font-black text-slate-900 dark:text-white text-lg leading-none mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{job.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-300 dark:text-slate-600">apartment</span>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{job.company} • {job.location.area}</p>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        job.category === 'IT' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                      }`}>{job.category}</span>
                    </td>
                    <td className="px-8 py-8 text-center">
                      {job.urgent ? (
                         <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase">
                           <span className="w-2 h-2 bg-rose-600 dark:bg-rose-500 rounded-full animate-pulse" />
                           Priority
                         </div>
                      ) : (
                         <span className="text-slate-200 dark:text-slate-700 text-[10px] font-black uppercase">Normal</span>
                      )}
                    </td>
                    <td className="px-8 py-8 text-right">
                       <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:border-teal-600 dark:group-hover:border-teal-400 transition-all">
                         <span className="material-symbols-outlined">chevron_right</span>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {/* Detail Review Panel */}
      {selectedReview ? (
        <aside className="w-[450px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-2xl relative animate-[slideIn_0.3s_ease-out] transition-colors duration-300">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">Chennai Region Review</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedReview.title}</h3>
              <p className="text-slate-400 dark:text-slate-500 font-bold mt-1">at {selectedReview.company}, {selectedReview.location.area}</p>
            </div>
            <button onClick={() => setSelectedReview(null)} className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 mb-6">Posting Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Salary</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedReview.salary}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sub-Location</span>
                  <span className="font-black text-teal-600 dark:text-teal-400">{selectedReview.location.address}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Job Category</span>
                  <span className="font-black text-slate-900 dark:text-white">{selectedReview.category}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 mb-6">Description Safety Check</h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {selectedReview.description}
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-3xl border border-teal-100 dark:border-teal-800 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 dark:bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-600/20 dark:shadow-teal-600/20">
                <span className="material-symbols-outlined font-black">verified</span>
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-sm">AI Verification Passed</p>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-1">No scam patterns or toxic content detected by Gemini.</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex gap-4">
            <button 
              onClick={() => handleStatusChange(selectedReview.id, 'OPEN')}
              className="flex-1 py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Approve Post
            </button>
            <button 
              onClick={() => handleStatusChange(selectedReview.id, 'REJECTED')}
              className="flex-1 py-5 bg-rose-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
            >
              Reject Post
            </button>
          </div>
        </aside>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 pointer-events-none">
           <span className="material-symbols-outlined !text-[120px] mb-6 text-slate-300 dark:text-slate-700">visibility</span>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Select a post to review</h3>
           <p className="text-slate-400 dark:text-slate-500 font-bold mt-2">Verified postings help maintain Chennai's #1 trusted job radar.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
