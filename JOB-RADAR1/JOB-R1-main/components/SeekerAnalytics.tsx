
import React, { useState, useEffect } from 'react';
import { UserProfile, Job, MarketPulseData, CareerNode, ResumeInsights } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { getResumeRadarInsights, getMarketPulse } from '../services/geminiService';

interface SeekerAnalyticsProps {
  user: UserProfile;
  jobs: Job[];
  onBack: () => void;
}

const SeekerAnalytics: React.FC<SeekerAnalyticsProps> = ({ user, jobs, onBack }) => {
  const [insights, setInsights] = useState<ResumeInsights | null>(null);
  const [marketPulse, setMarketPulse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MARKET' | 'RESUME' | 'ROADMAP'>('MARKET');

  useEffect(() => {
    const fetchData = async () => {
      if (user.aiInsights) {
        setInsights(user.aiInsights);
        setMarketPulse(user.aiInsights.marketInsights);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const [resInsights, resPulse] = await Promise.all([
        getResumeRadarInsights(user),
        getMarketPulse(user.skills[0] || 'Software Engineer')
      ]);
      setInsights(resInsights);
      setMarketPulse(resPulse);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const salaryData = [
    { hub: 'OMR', salary: 12 },
    { hub: 'Guindy', salary: 10.5 },
    { hub: 'Tidel Park', salary: 11.5 },
    { hub: 'Perungudi', salary: 9.8 },
    { hub: 'Ambattur', salary: 8.5 },
  ];

  const roadmap: CareerNode[] = [
    { 
      id: '1', 
      title: 'Current Standing', 
      status: 'COMPLETED', 
      skillsToGain: (user.skills || []).slice(0, 3), 
      description: 'Your verified foundations in ' + (user.skills?.[0] || 'your core field') 
    },
    { 
      id: '2', 
      title: 'Market Competitiveness', 
      status: 'IN_PROGRESS', 
      skillsToGain: insights?.suggestedSkills || ['System Design', 'Cloud Native'], 
      description: insights?.careerPaths?.[0] || 'Focus on scaling and deployment architecture within the Chennai ecosystem.' 
    },
    { 
      id: '3', 
      title: 'Tech Hub Lead', 
      status: 'LOCKED', 
      skillsToGain: insights?.nextSteps || ['Management', 'Product Strategy'], 
      description: 'The pinnacle of your ' + (insights?.topRoles?.[0] || 'target role') + ' trajectory.' 
    },
  ];

  const marketTrends = insights?.marketInsights.split('.').filter(s => s.trim().length > 0) || [];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Scanning Chennai Radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f9fafb] dark:bg-slate-950">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Market Intelligence</h1>
            <p className="text-slate-500 font-bold text-sm">Real-time data for ${user.location?.area || 'Chennai'}.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-[24px] w-fit">
          {(['MARKET', 'RESUME', 'ROADMAP'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'MARKET' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-teal-900 border border-teal-800 p-8 rounded-[40px] text-white overflow-hidden relative group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-2">Market Trends</p>
                    <ul className="space-y-4">
                      {marketTrends.slice(0, 3).map((trend, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span className="material-symbols-outlined text-teal-400 text-sm mt-1">trending_up</span>
                          <p className="text-sm font-bold leading-tight">{trend}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 !text-8xl opacity-10 group-hover:scale-110 transition-transform">insights</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black dark:text-white">Annual Salary Benchmarks (LPA)</h3>
                    <span className="text-xs font-bold text-teal-600">Top Hubs</span>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salaryData}>
                        <XAxis dataKey="hub" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                        <Tooltip 
                            cursor={{ fill: '#f1f5f9' }} 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="salary" radius={[10, 10, 0, 0]}>
                          {salaryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#0f998b' : '#ccfbf1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                 <h3 className="text-lg font-black dark:text-white mb-6">Market Activity Heatmap</h3>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { t: '9AM', v: 40 }, { t: '12PM', v: 85 }, { t: '3PM', v: 65 }, { t: '6PM', v: 95 }, { t: '9PM', v: 50 },
                      ]}>
                        <XAxis dataKey="t" hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="v" stroke="#0f998b" fillOpacity={1} fill="url(#colorV)" />
                        <defs>
                          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f998b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0f998b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'RESUME' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                   <div className="relative w-32 h-32 mb-6">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-slate-100 dark:text-slate-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-teal-500" strokeDasharray={`${insights?.resumeScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black">{insights?.resumeScore || 0}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ATS Rank</span>
                      </div>
                   </div>
                   <h3 className="text-xl font-black mb-2">{insights?.resumeScore && insights.resumeScore > 70 ? 'AI Verified Elite' : 'Optimization Signal'}</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">
                     {user.resumeText ? 'Your resume has been analyzed by the Gemini Intelligence Engine.' : 'Please upload your resume in the Profile section to unlock full ATS analysis.'}
                   </p>
                </div>

                <div className="space-y-6">
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Est. Market Value</p>
                      <p className="text-3xl font-black text-teal-600">{insights?.marketValue || '₹ 8.5L - 12L'}</p>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Radar Target Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {insights?.topRoles.map(role => (
                          <span key={role} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">{role}</span>
                        ))}
                      </div>
                   </div>
                   {insights?.nextSteps && insights.nextSteps.length > 0 && (
                     <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Priority Next Steps</p>
                        <div className="space-y-3">
                          {insights.nextSteps.map((step, i) => (
                            <div key={i} className="flex gap-3 items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                               <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                               {step}
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ROADMAP' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {roadmap.map((node, i) => (
                <div key={node.id} className="relative flex gap-8 group">
                  {i !== roadmap.length - 1 && (
                    <div className="absolute left-[23px] top-10 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800 transition-colors" />
                  )}
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all ${
                    node.status === 'COMPLETED' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 
                    node.status === 'IN_PROGRESS' ? 'bg-white dark:bg-slate-800 border-2 border-teal-500 text-teal-500 animate-pulse' : 
                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined">{node.status === 'COMPLETED' ? 'check_circle' : node.status === 'IN_PROGRESS' ? 'hourglass_top' : 'lock'}</span>
                  </div>
                  <div className={`p-8 rounded-[40px] border transition-all flex-1 ${
                    node.status === 'COMPLETED' ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' :
                    node.status === 'IN_PROGRESS' ? 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900 shadow-xl shadow-teal-500/5' :
                    'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-60'
                  }`}>
                    <h4 className="text-xl font-black mb-1">{node.title}</h4>
                    <p className="text-sm text-slate-500 mb-6 font-medium">{node.description}</p>
                    <div className="flex flex-wrap gap-2">
                       {node.skillsToGain.map(s => (
                         <span key={s} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           node.status === 'COMPLETED' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                         }`}>{s}</span>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeekerAnalytics;
