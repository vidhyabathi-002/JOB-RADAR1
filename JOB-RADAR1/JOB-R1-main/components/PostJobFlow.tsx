
import React, { useState } from 'react';
import { Job, JobCategory, JobType, WorkMode, ExperienceLevel } from '../types';
import LocationPicker from './LocationPicker';

interface PostJobFlowProps {
  onCancel: () => void;
  onFinish: (job: Job) => void;
  darkMode: boolean;
  initialJob?: Job;
}

const PostJobFlow: React.FC<PostJobFlowProps> = ({ onCancel, onFinish, darkMode, initialJob }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: initialJob?.title || '',
    category: initialJob?.category || JobCategory.LOCAL,
    salary: initialJob?.salary || '₹25,000 - ₹40,000',
    description: initialJob?.description || '',
    urgent: initialJob?.urgent || false,
    type: initialJob?.type || 'FULL_TIME',
    workMode: initialJob?.workMode || 'ON_SITE',
    experience: initialJob?.experience || 'ENTRY',
    location: initialJob?.location || { lat: 13.0827, lng: 80.2707, address: 'Chennai', area: 'Chennai' },
    skills_required: initialJob?.skills_required || []
  });

  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills_required?.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...(formData.skills_required || []), skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills_required: (formData.skills_required || []).filter(s => s !== skill)
    });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    const job: Job = {
      id: initialJob?.id || Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      company: initialJob?.company || 'My Enterprise Hub',
      category: formData.category!,
      salary: formData.salary!,
      type: formData.type!,
      workMode: formData.workMode!,
      experience: formData.experience!,
      location: formData.location!,
      skills_required: formData.skills_required!,
      urgent: formData.urgent!,
      posted_at: initialJob?.posted_at || new Date().toISOString(),
      description: formData.description!,
      status: initialJob?.status || 'OPEN'
    };
    onFinish(job);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f9fafb] dark:bg-slate-950 overflow-y-auto p-10 items-center transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <div className="mb-12 bg-white dark:bg-slate-900 p-10 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em] mb-2">Job Configuration • Step {step} of 4</p>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {step === 1 ? 'Primary Details' : step === 2 ? 'Experience & Mode' : step === 3 ? 'Exact Location Radar' : 'Review & Broadast'}
              </h1>
            </div>
            <div className="relative size-16">
               <svg className="size-full" viewBox="0 0 36 36">
                  <path className="text-slate-100 dark:text-slate-800" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-teal-600 dark:text-teal-400" strokeDasharray={`${(step / 4) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{Math.round((step / 4) * 100)}%</div>
            </div>
          </div>
          
          <div className="space-y-10 py-4 min-h-[450px]">
            {step === 1 && (
              <div className="space-y-8 animate-[slideUp_0.3s_ease-out]">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[28px] py-5 px-8 text-xl font-black focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/20 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 transition-all"
                      placeholder="e.g. Senior Software Architect"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Market Category</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(JobCategory).map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setFormData({...formData, category: cat})}
                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.category === cat ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600 dark:border-teal-500 shadow-lg shadow-teal-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
                          >{cat}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Salary Budget</label>
                        <input 
                          value={formData.salary}
                          onChange={e => setFormData({...formData, salary: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[28px] py-4 px-8 text-base font-black text-slate-900 dark:text-white placeholder-slate-300 transition-all" 
                          placeholder="e.g. ₹5L - ₹9L PA" 
                        />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tech Stack / Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills_required?.map(skill => (
                        <span key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-100 dark:border-teal-800 transition-all">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         value={skillInput}
                         onChange={e => setSkillInput(e.target.value)}
                         onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                         className="flex-1 bg-slate-50 dark:bg-slate-950 border-none rounded-[28px] py-4 px-8 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-300"
                         placeholder="Add skill and press enter..."
                       />
                       <button onClick={handleAddSkill} className="px-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest">Add</button>
                    </div>
                 </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-[slideUp_0.3s_ease-out]">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Work Arrangement</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['ON_SITE', 'REMOTE', 'HYBRID'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setFormData({...formData, workMode: mode as WorkMode})}
                        className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.workMode === mode ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-transparent'}`}
                      >{mode.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Job Type</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[24px] py-4.5 px-8 text-sm font-black text-slate-400 dark:text-slate-500 focus:text-slate-900 dark:focus:text-white transition-colors"
                      >
                         <option value="FULL_TIME">Full-time</option>
                         <option value="PART_TIME">Part-time</option>
                         <option value="CONTRACT">Contract</option>
                         <option value="INTERN">Internship</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['ENTRY', 'MID', 'SENIOR', 'LEAD'].map(lvl => (
                          <button 
                            key={lvl}
                            onClick={() => setFormData({...formData, experience: lvl as ExperienceLevel})}
                            className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${formData.experience === lvl ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-transparent hover:border-slate-200'}`}
                          >{lvl}</button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Comprehensive Description</label>
                   <textarea 
                     className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[32px] py-6 px-8 text-sm font-medium min-h-[160px] text-slate-900 dark:text-white placeholder-slate-300 transition-all leading-relaxed" 
                     placeholder="Outline responsibilities, day-to-day tasks, and performance expectations..." 
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
                 <LocationPicker 
                   darkMode={darkMode}
                   initialLocation={formData.location}
                   onLocationSelect={(loc) => setFormData({...formData, location: loc})}
                 />
                 
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Precise Location / Landmark</label>
                   <input 
                     type="text"
                     placeholder="E.g., Opp. Phase 2 IT Park, 4th Floor..." 
                     className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[24px] py-4.5 px-8 text-sm font-black text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
                     value={formData.location?.address || ''}
                     onChange={e => setFormData({
                       ...formData, 
                       location: formData.location ? { ...formData.location, address: e.target.value } : { lat: 13.0827, lng: 80.2707, address: e.target.value, area: 'Chennai' }
                     })}
                   />
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-start gap-4">
                       <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">map</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Decoded Area</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{formData.location?.area}</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-[slideUp_0.3s_ease-out]">
                 <div className="bg-slate-900 dark:bg-teal-950 p-10 rounded-[44px] text-white shadow-2xl relative overflow-hidden transition-colors">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{formData.category}</span>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{formData.workMode}</span>
                      </div>
                      <h3 className="text-4xl font-black mb-2 tracking-tight">{formData.title}</h3>
                      <p className="text-teal-400 font-bold uppercase tracking-widest text-xs mb-8">{formData.location?.area} • {formData.salary}</p>
                      
                      <div className="flex flex-wrap gap-2 opacity-80">
                         {formData.skills_required?.map(s => <span key={s} className="text-[9px] font-black uppercase tracking-widest">#{s}</span>)}
                      </div>
                    </div>
                    <span className="material-symbols-outlined absolute right-0 bottom-0 !text-[200px] text-white/5 translate-x-1/4 translate-y-1/4">radar</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Urgency Status</p>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className={`size-10 rounded-xl flex items-center justify-center ${formData.urgent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{formData.urgent ? 'bolt' : 'notifications_off'}</span>
                             </div>
                             <span className="font-black text-sm">{formData.urgent ? 'High Priority' : 'Standard'}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.urgent} onChange={e => setFormData({...formData, urgent: e.target.checked})} className="sr-only peer" />
                            <div className="w-12 h-6 bg-slate-100 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                          </label>
                       </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Outlook</p>
                       <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-teal-600 text-2xl">trending_up</span>
                          <span className="text-xs font-bold text-slate-500">High seeker activity predicted in <strong className="text-slate-900 dark:text-white">{formData.location?.area}</strong> hub.</span>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-4">
             {step > 1 ? (
               <button onClick={handleBack} className="flex-1 py-5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-[24px] font-black uppercase tracking-widest text-xs hover:text-slate-900 dark:hover:text-white transition-all">Back</button>
             ) : (
               <button onClick={onCancel} className="flex-1 py-5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-[24px] font-black uppercase tracking-widest text-xs hover:text-rose-600 transition-all">Discard Draft</button>
             )}
             
             {step < 4 ? (
               <button 
                 disabled={step === 1 && !formData.title}
                 onClick={handleNext} 
                 className="flex-[2_2_0%] py-5 bg-teal-600 dark:bg-teal-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-600/30 dark:shadow-teal-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
               >Continue to {step === 1 ? 'Requirements' : step === 2 ? 'Location' : 'Review'}</button>
             ) : (
               <button onClick={handleSubmit} className="flex-[2_2_0%] py-5 bg-slate-900 dark:bg-slate-800 text-teal-400 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/30 active:scale-95 transition-all">Broadcast to Seeker Radar</button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobFlow;
