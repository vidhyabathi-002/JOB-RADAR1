
import React, { useState, useRef } from 'react';
import { UserProfile, Experience, Education } from '../types';
import { analyzeResume } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ProfileProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNavigate: (view: any) => void;
  showToast?: (msg: string, type?: any) => void;
  onResumeUpload?: (text: string) => Promise<void>;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
}

const ProfileView: React.FC<ProfileProps> = ({ user, setUser, onNavigate, showToast, onResumeUpload, onUpdateProfile }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPERIENCE' | 'EDUCATION' | 'INTELLIGENCE'>('OVERVIEW');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
        fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast?.('Please upload a PDF file for accurate AI analysis', 'ERROR');
      return;
    }

    setIsExtracting(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (onResumeUpload) {
        await onResumeUpload(extractedText);
      } else {
        const analysis = await analyzeResume(extractedText);
        setUser(prev => ({ 
          ...prev, 
          skills: Array.from(new Set([...(prev?.skills || []), ...analysis.extractedSkills])),
          resumeAnalysis: analysis,
          experience: analysis.experience.map(exp => ({ ...exp, id: Math.random().toString(36).substr(2, 9) })),
          education: analysis.education.map(edu => ({ ...edu, id: Math.random().toString(36).substr(2, 9) })),
          bio: analysis.summary,
          aiVerified: true,
          profileStrength: Math.max(analysis.atsScore, 65)
        }));
        showToast?.('Intelligence Pulse: Profile updated with AI analysis!', 'SUCCESS');
      }
    } catch (error) {
      console.error("Extraction error:", error);
      showToast?.('Unable to parse document. Please ensure it is not password protected.', 'ERROR');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsEditing(false);
    if (onUpdateProfile) {
      const updates: Partial<UserProfile> = {
        name: user.name,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        education: user.education,
        location: user.location,
        // Calculate new strength based on data completeness
        profileStrength: calculateStrength(user)
      };
      await onUpdateProfile(updates);
    }
  };

  const calculateStrength = (u: UserProfile) => {
    let score = 10;
    if (u.bio) score += 10;
    if (u.skills?.length > 0) score += 15;
    if (u.experience?.length > 0) score += 20;
    if (u.education?.length > 0) score += 15;
    if (u.aiVerified) score += 20;
    if (u.resumeAnalysis) score += 10;
    return Math.min(score, 100);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      company: '',
      role: '',
      duration: '',
      description: ''
    };
    setUser(prev => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])]
    }));
    setActiveTab('EXPERIENCE');
    setIsEditing(true);
  };

  const removeExperience = (id: string) => {
    setUser(prev => ({
      ...prev,
      experience: prev.experience?.filter(e => e.id !== id) || []
    }));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setUser(prev => ({
      ...prev,
      experience: prev.experience?.map(e => e.id === id ? { ...e, ...updates } : e) || []
    }));
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = user.skills.filter(s => s !== skillToRemove);
    setUser(prev => ({ ...prev, skills: updatedSkills }));
    if (!isEditing && onUpdateProfile) {
      onUpdateProfile({ skills: updatedSkills });
    }
  };

  const addSkill = () => {
    const newSkill = prompt('Enter a new skill (e.g., React, Python, Sales):');
    if (newSkill && !user.skills.includes(newSkill)) {
      const updatedSkills = [...user.skills, newSkill];
      setUser(prev => ({ ...prev, skills: updatedSkills }));
      if (!isEditing && onUpdateProfile) {
        onUpdateProfile({ skills: updatedSkills });
      }
    }
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Math.random().toString(36).substr(2, 9),
      institution: '',
      degree: '',
      year: ''
    };
    setUser(prev => ({
      ...prev,
      education: [newEdu, ...(prev.education || [])]
    }));
    setActiveTab('EDUCATION');
    setIsEditing(true);
  };

  const removeEducation = (id: string) => {
    setUser(prev => ({
      ...prev,
      education: prev.education?.filter(e => e.id !== id) || []
    }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setUser(prev => ({
      ...prev,
      education: prev.education?.map(e => e.id === id ? { ...e, ...updates } : e) || []
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcfb] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[32px] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {isEditing ? (
                  <input 
                    value={user.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="text-4xl font-black text-slate-900 dark:text-white tracking-tight bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100 dark:border-teal-800">
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                    Verified
                  </span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mb-6 leading-relaxed">
                {user.bio || "Craft your professional narrative. Add a bio to tell employers about your journey and aspirations."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  <span className="text-xs font-bold">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {isEditing ? (
                    <input 
                      value={user.location?.area || ''}
                      onChange={(e) => updateProfile({ location: { ...user.location!, area: e.target.value } })}
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-1 text-xs font-bold w-32 outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
                      placeholder="e.g. OMR, Chennai"
                    />
                  ) : (
                    <span className="text-xs font-bold">{user.location?.area || 'Location not set'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-6 py-3 bg-slate-900 dark:bg-teal-600 text-white rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 dark:shadow-teal-600/20 flex items-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">{isEditing ? 'save' : 'edit'}</span>
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
              
              {!isEditing && (
                <button 
                  onClick={() => onUpdateProfile && onUpdateProfile({})}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800 rounded-2xl font-black text-[10px] hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Pulse Deep Analysis
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 mb-10 border-b border-slate-200 dark:border-slate-800 px-4 transition-colors duration-300">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: 'grid_view' },
            { id: 'EXPERIENCE', label: 'Experience', icon: 'work' },
            { id: 'EDUCATION', label: 'Education', icon: 'school' },
            { id: 'INTELLIGENCE', label: 'Intelligence Hub', icon: 'psychology' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 text-sm font-black transition-all relative ${
                activeTab === tab.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 dark:bg-teal-400 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px] mb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'OVERVIEW' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">person</span>
                      About Me
                    </h2>
                    <textarea 
                      readOnly={!isEditing}
                      value={user.bio}
                      onChange={(e) => updateProfile({ bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className={`w-full p-4 rounded-2xl text-sm font-medium leading-relaxed min-h-[150px] transition-all ${
                        isEditing ? 'bg-slate-50 dark:bg-slate-800 border-teal-200 dark:border-teal-900/30 focus:ring-2 focus:ring-teal-500 dark:text-white' : 'bg-transparent border-transparent resize-none dark:text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">link</span>
                      Social Presence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                          <span className="material-symbols-outlined">link</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">LinkedIn</p>
                          <input 
                            readOnly={!isEditing}
                            value={user.socialLinks?.linkedin}
                            onChange={(e) => updateProfile({ socialLinks: { ...user.socialLinks, linkedin: e.target.value } })}
                            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white w-full outline-none"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-950 rounded-xl flex items-center justify-center text-white">
                          <span className="material-symbols-outlined">code</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">GitHub</p>
                          <input 
                            readOnly={!isEditing}
                            value={user.socialLinks?.github}
                            onChange={(e) => updateProfile({ socialLinks: { ...user.socialLinks, github: e.target.value } })}
                            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white w-full outline-none"
                            placeholder="github.com/username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-teal-600 dark:bg-teal-700 text-white rounded-3xl p-8 shadow-2xl shadow-teal-600/30 dark:shadow-none transition-colors duration-300">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-80 mb-6">
                      Radar Profile Strength
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl font-black tracking-tighter">
                        {user.profileStrength || 1}%
                      </span>
                      <span className="material-symbols-outlined text-5xl opacity-40">
                        {user.aiVerified ? 'auto_awesome' : 'verified_user'}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 h-2.5 rounded-full mb-8">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${user.profileStrength || 1}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold leading-relaxed mb-8 opacity-90">
                      {user.aiVerified 
                        ? "AI verified! Based on your resume, your profile is highly optimized for technical roles."
                        : "Upload a resume in the Intelligence Hub to automatically verify your profile strength."}
                    </p>
                    <button 
                      onClick={() => setActiveTab('INTELLIGENCE')}
                      className="w-full py-3 bg-white text-teal-700 dark:text-teal-800 font-black rounded-2xl text-sm hover:scale-[1.02] transition-all"
                    >
                      {user.aiVerified ? 'View AI Insights' : 'Verify with AI'}
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">assignment_turned_in</span>
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {(user.applications || []).slice(0, 2).map(app => (
                        <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                            <span className="material-symbols-outlined text-xl">send</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{app.jobTitle}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{app.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      ))}
                      {(!user.applications || user.applications.length === 0) && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center py-4 italic">No recent activity.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'EXPERIENCE' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Professional Journey</h2>
                  <button 
                    onClick={addExperience}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl font-black text-xs hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Career Milestone
                  </button>
                </div>

                <div className="max-h-[800px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                  {user.experience?.length ? (
                    user.experience.map((exp) => (
                      <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative group transition-colors duration-300">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex gap-6">
                              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 shrink-0 transition-colors duration-300">
                                <span className="material-symbols-outlined text-3xl">business</span>
                              </div>
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <input 
                                      value={exp.role}
                                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-lg font-black dark:text-white"
                                      placeholder="Position Title"
                                    />
                                    <input 
                                      value={exp.company}
                                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-teal-600 dark:text-teal-400 font-bold text-sm"
                                      placeholder="Company Name"
                                    />
                                    <input 
                                      value={exp.duration}
                                      onChange={(e) => updateExperience(exp.id, { duration: e.target.value })}
                                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-slate-400 text-xs font-bold uppercase tracking-widest"
                                      placeholder="Duration (e.g. 2020 - Present)"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{exp.role || 'New Position'}</h3>
                                    <p className="text-teal-600 dark:text-teal-400 font-bold text-sm mb-1">{exp.company || 'Company'}</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{exp.duration || 'Period'}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {isEditing ? (
                              <textarea 
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-medium leading-relaxed min-h-[120px] dark:text-slate-300"
                                placeholder="Highlight your key achievements and responsibilities..."
                              />
                            ) : (
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                {exp.description || "Describe your professional impact here..."}
                              </p>
                            )}
                          </div>
                          {isEditing && (
                            <button 
                              onClick={() => removeExperience(exp.id)}
                              className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-xl transition-colors shrink-0"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors duration-300">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">work_off</span>
                      </div>
                      <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Your Story Starts Here</p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Add your professional experiences to unlock personalized job matches.</p>
                      <button onClick={addExperience} className="px-8 py-3 bg-teal-600 text-white font-black rounded-2xl hover:scale-105 transition-all">Add Your First Role</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'EDUCATION' && (
              <motion.div
                key="education"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Academic Background</h2>
                  <button 
                    onClick={addEducation}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl font-black text-xs hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    Add Education
                  </button>
                </div>

                <div className="max-h-[800px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                  {user.education?.length ? (
                    user.education.map((edu) => (
                      <div key={edu.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-300">
                        <div className="flex gap-6 flex-1">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 shrink-0 transition-colors duration-300">
                            <span className="material-symbols-outlined text-3xl">school</span>
                          </div>
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-3">
                                <input 
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-lg font-black dark:text-white"
                                  placeholder="Degree / Qualification"
                                />
                                <input 
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-teal-600 dark:text-teal-400 font-bold text-sm"
                                  placeholder="Institution Name"
                                />
                                <input 
                                  value={edu.year}
                                  onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 text-slate-400 text-xs font-bold uppercase tracking-widest"
                                  placeholder="Year of Completion"
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{edu.degree || 'New Qualification'}</h3>
                                <p className="text-teal-600 dark:text-teal-400 font-bold text-sm mb-1">{edu.institution || 'Institution'}</p>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Class of {edu.year || 'YYYY'}</p>
                              </>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <button 
                            onClick={() => removeEducation(edu.id)}
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-xl transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors duration-300">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">history_edu</span>
                      </div>
                      <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Learning Milestone</p>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Showcase your academic achievements.</p>
                      <button onClick={addEducation} className="px-8 py-3 bg-teal-600 text-white font-black rounded-2xl hover:scale-105 transition-all">Add Education</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'INTELLIGENCE' && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* AI Upload & Identity Pulse */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-teal-500/5 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <span className="material-symbols-outlined text-4xl">psychology</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-black dark:text-white">Career Intelligence Hub</h2>
                          <p className="text-xs font-bold text-slate-400">Powered by Gemini Deep Learning Engine</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">Advanced Analytics</span>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Real-time Chennai Data</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => !isExtracting && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center group transition-all cursor-pointer relative overflow-hidden ${
                        isExtracting 
                          ? 'border-teal-200 bg-teal-50/10' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-teal-600 bg-slate-50/30 dark:bg-slate-800/20'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isExtracting} />
                      
                      {isExtracting ? (
                        <div className="flex flex-col items-center py-6">
                          <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                              <span className="material-symbols-outlined text-4xl">neurology</span>
                            </div>
                          </div>
                          <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Engaging Analysis Core...</p>
                          <p className="text-sm font-bold text-teal-600 animate-pulse">Processing career trajectory data</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center mb-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-5xl">upload_file</span>
                          </div>
                          <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">Re-verify Radar Integrity</p>
                          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mb-6">Upload your latest PDF resume to synchronize your profile with the market intelligence engine.</p>
                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-teal-100 dark:border-teal-800">
                              ATS Scan
                            </div>
                            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 dark:border-indigo-800">
                              Roadmap Gen
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Strength Widget */}
                    <div className="bg-slate-900 text-white rounded-[40px] p-8 relative overflow-hidden h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-teal-400 mb-6">Radar Strength</h3>
                        <div className="flex items-end gap-2 mb-6">
                          <span className="text-5xl font-black tracking-tighter">{user.profileStrength}%</span>
                          <span className="text-xs font-bold text-teal-500 pb-2">Active Target</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${user.profileStrength}%` }}
                            className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                          />
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-indigo-400 text-sm">auto_awesome</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quality Pulse</p>
                        </div>
                        <p className="text-sm font-black text-white">{user.fullReport?.intelligence?.profile_quality || "Calculating..."}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intelligence Rows */}
                {user.fullReport && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Career Roadmap & Skills Alignment */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Personal AI vs Market Search Alignment */}
                      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">stacked_line_chart</span>
                              Market Alignment (Web Verified)
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Comparing your profile skills vs live market demand</p>
                          </div>
                          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] rounded-lg font-black uppercase tracking-widest border border-teal-100 dark:border-teal-800">
                            {user.skills.length} Skills Loaded
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Your Profile Strength</h4>
                            <div className="flex flex-wrap gap-2">
                              {user.skills.map(skill => {
                                const isHighDemand = user.fullReport?.market_intelligence.market_demand_skills.some(
                                  d => d.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(d.toLowerCase())
                                );
                                return (
                                  <div key={skill} className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
                                    isHighDemand 
                                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800' 
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                  }`}>
                                    {isHighDemand && <span className="material-symbols-outlined text-sm">local_fire_department</span>}
                                    {skill}
                                  </div>
                                );
                              })}
                              {user.skills.length === 0 && (
                                <p className="text-xs text-slate-500 font-bold italic">No skills added to profile yet.</p>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mb-4">Urgent Market Gaps</h4>
                            <div className="space-y-3">
                              {user.fullReport.skill_gap.missing_skills.map((missing, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-rose-400 text-sm">error</span>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{missing}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Career Roadmap */}
                      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">route</span>
                            Smart Career Roadmap
                          </h3>
                          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] rounded-lg font-black uppercase tracking-widest border border-teal-100 dark:border-teal-800">Priority Sync</span>
                        </div>

                        <div className="space-y-6">
                          {user.fullReport.career_roadmap.roadmap.map((step, idx) => (
                            <div key={idx} className="relative pl-12 pb-2">
                              {idx !== user.fullReport!.career_roadmap.roadmap.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                              )}
                              <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                step.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' :
                                step.priority === 'Medium' ? 'bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-900/20 dark:border-teal-900/30' :
                                'bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{step.step}</h4>
                                <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-3">{step.skill}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <h3 className="text-xl font-black dark:text-white mb-8 flex items-center gap-3">
                          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">smart_display</span>
                          AI Curated Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {user.fullReport.learning_resources.learning_resources.map((res, idx) => (
                            <a 
                              key={idx}
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.youtube_search)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-400 transition-all"
                            >
                              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">play_arrow</span>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-0.5">{res.skill}</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Tutorial: {res.youtube_search}</p>
                              </div>
                              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">open_in_new</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Market Intelligence Sidebar */}
                    <div className="space-y-8">
                      <div className="bg-indigo-900 text-white rounded-[40px] p-8 relative overflow-hidden transition-colors duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-8">Market Pulse</h3>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Competition Level</p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-black">{user.fullReport.market_intelligence.competition_level}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className={`w-4 h-1 rounded-full ${
                                    user.fullReport!.market_intelligence.competition_level === 'High' ? (i <= 3 ? 'bg-rose-400' : 'bg-white/10') :
                                    user.fullReport!.market_intelligence.competition_level === 'Medium' ? (i <= 2 ? 'bg-amber-400' : 'bg-white/10') :
                                    (i <= 1 ? 'bg-teal-400' : 'bg-white/10')
                                  }`}></div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Salary Expectation</p>
                            <p className="text-3xl font-black text-white leading-none">{user.fullReport.market_intelligence.salary_expectation}</p>
                            <p className="text-[10px] font-bold text-indigo-300 mt-2">Regional Benchmark: Chennai</p>
                          </div>

                          <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4">Market Gap</p>
                            <div className="space-y-2">
                              {user.fullReport.market_intelligence.user_vs_market_gap.map((gap, i) => (
                                <div key={i} className="flex gap-3 text-[11px] font-bold text-slate-300">
                                  <span className="material-symbols-outlined text-xs text-rose-400">warning</span>
                                  {gap}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <h3 className="text-lg font-black dark:text-white mb-6">Job Fit Forecast</h3>
                        <div className="space-y-4">
                          {user.fullReport.job_fit.map((fit, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[20px] border border-slate-100 dark:border-slate-700">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black dark:text-white">{fit.role}</span>
                                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">{fit.match_score}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-teal-500 rounded-full" 
                                  style={{ width: fit.match_score }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                        <h3 className="text-lg font-black dark:text-white mb-6">Optimization Tips</h3>
                        <div className="space-y-3">
                          {user.fullReport.improvement_tips.map((tip, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-teal-50/30 dark:bg-teal-900/10 rounded-2xl border border-teal-100/50 dark:border-teal-900/30">
                              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">lightbulb</span>
                              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Bar */}
                {!user.fullReport && (
                  <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors duration-300">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-6">
                      <span className="material-symbols-outlined text-4xl">analytics</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Intelligence Engine Standby</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm mx-auto">Upload your resume or update your skills to generate the full Career Intelligence Report.</p>
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-teal-600 text-white font-black rounded-2xl hover:scale-105 transition-all">Launch Deep Scan</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Scrollbar CSS Injection */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

export default ProfileView;
