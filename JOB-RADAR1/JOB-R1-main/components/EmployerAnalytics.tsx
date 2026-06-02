
import React, { useEffect, useState } from 'react';
import { Job } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { getEmployerMarketAnalytics } from '../services/geminiService';

interface EmployerAnalyticsProps {
  jobs: Job[];
  user: any;
  onBack: () => void;
}

const EmployerAnalytics: React.FC<EmployerAnalyticsProps> = ({ jobs, user, onBack }) => {
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  const employerJobs = jobs.filter(j => 
    j.employerId === user?.id || 
    j.company === 'Global Tech OMR' || 
    j.company === 'Sree Krishna Sweets'
  );

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      const data = await getEmployerMarketAnalytics(employerJobs);
      setAiAnalytics(data);
      setLoadingAI(false);
    };
    if (employerJobs.length > 0) {
      fetchAI();
    } else {
      setLoadingAI(false);
    }
  }, [jobs]);
  
  // Mock data for analytics
  const performanceData = employerJobs.map(job => ({
    name: job.title.length > 15 ? job.title.substring(0, 12) + '...' : job.title,
    views: Math.floor(Math.random() * 2000) + 500,
    applies: Math.floor(Math.random() * 100) + 10,
    conversion: 0
  })).map(item => ({
    ...item,
    conversion: parseFloat(((item.applies / item.views) * 100).toFixed(1))
  }));

  const timelineData = [
    { day: 'Mon', applies: 12, views: 140 },
    { day: 'Tue', applies: 18, views: 180 },
    { day: 'Wed', applies: 15, views: 160 },
    { day: 'Thu', applies: 25, views: 250 },
    { day: 'Fri', applies: 32, views: 310 },
    { day: 'Sat', applies: 21, views: 220 },
    { day: 'Sun', applies: 14, views: 150 },
  ];

  const engagementData = [
    { name: 'Direct Search', value: 45 },
    { name: 'Radar Map', value: 35 },
    { name: 'Social Shares', value: 15 },
    { name: 'Job Alerts', value: 5 },
  ];

  const COLORS = ['#0f998b', '#14b8a6', '#5eead4', '#ccfbf1'];

  const totalViews = performanceData.reduce((acc, curr) => acc + curr.views, 0);
  const totalApplies = performanceData.reduce((acc, curr) => acc + curr.applies, 0);
  const avgConversion = totalViews > 0 ? (totalApplies / totalViews * 100).toFixed(1) : '0.0';

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f9fafb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Performance Insights</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Quantifying your impact across Chennai's job market.</p>
          </div>
        </div>

        {/* AI Market Intelligence Segment */}
        <AnimatePresence>
          {loadingAI ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-10 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-[40px] p-8 flex items-center gap-4"
            >
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-indigo-600 dark:text-indigo-400 font-black tracking-widest text-[10px] uppercase">AI Analytics Engine</p>
                <p className="text-slate-800 dark:text-slate-200 font-bold">Scanning live Chennai market trends based on your postings...</p>
              </div>
            </motion.div>
          ) : aiAnalytics && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 bg-indigo-900 text-white rounded-[40px] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-indigo-300">auto_awesome</span>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-300">Live Market Pulse</h3>
                </div>
                <p className="text-lg font-medium leading-relaxed mb-6">{aiAnalytics.marketInsights}</p>
                
                <div className="flex flex-wrap gap-4 mt-auto">
                  <div className="bg-black/20 p-4 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Hiring Velocity</p>
                    <p className="text-xl font-black text-white">{aiAnalytics.hiringVelocity}</p>
                  </div>
                  {aiAnalytics.salaryTrends?.[0] && (
                    <div className="bg-black/20 p-4 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Avg Salary ({aiAnalytics.salaryTrends[0].role})</p>
                      <p className="text-xl font-black text-white">₹ {aiAnalytics.salaryTrends[0].avgSalaryLPA}L</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-500">location_on</span>
                  Top Talent Hubs
                </h3>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiAnalytics.topTalentHubs} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="hub" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="talentDensity" radius={[0, 10, 10, 0]} fill="#0f998b" barSize={16}>
                         {aiAnalytics.topTalentHubs?.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#0f998b' : '#ccfbf1'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Reach', value: totalViews.toLocaleString(), icon: 'visibility', color: 'text-blue-600', trend: '+12.4%' },
            { label: 'Total Applications', value: totalApplies, icon: 'edit_note', color: 'text-teal-600', trend: '+8.2%' },
            { label: 'Avg. Conversion', value: `${avgConversion}%`, icon: 'analytics', color: 'text-emerald-600', trend: '+2.1%' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Main Traffic Chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Application Velocity</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 700 }}
                  />
                  <Line type="monotone" dataKey="applies" stroke="#0f998b" strokeWidth={4} dot={{ r: 6, fill: '#0f998b', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Channels */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Discovery Source</h3>
            <div className="h-64 w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontWeight: 700, fontSize: '12px', paddingLeft: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white dark:bg-slate-900 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Listing Performance</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-teal-600 border border-teal-100 px-4 py-2 rounded-xl">Download Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Job Title</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Impressions</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Candidates</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Conversion</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {performanceData.map((data, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900 dark:text-white">{data.name}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600 dark:text-slate-400">{data.views.toLocaleString()}</span>
                        <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(data.views/2500)*100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400">{data.applies}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${data.conversion > 4 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {data.conversion}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-slate-400 hover:text-teal-600 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
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
  );
};

export default EmployerAnalytics;
