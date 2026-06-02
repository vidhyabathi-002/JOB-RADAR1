
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, UserProfile, Job, JobCategory, ApplicationStatus } from './types';
import { MOCK_JOBS, CHENNAI_CENTER } from './constants';
import MapContainer from './components/MapContainer';
import BottomSheet from './components/BottomSheet';
import Header from './components/Header';
import JobDetails from './components/JobDetails';
import ProfileView from './components/ProfileView';
import EmployerDashboard from './components/EmployerDashboard';
import AdminPanel from './components/AdminPanel';
import AdminSettings from './components/AdminSettings';
import FilterOverlay from './components/FilterOverlay';
import SuccessScreen from './components/SuccessScreen';
import LocationSelection from './components/LocationSelection';
import AlertsView from './components/AlertsView';
import EmployerAlertsView from './components/EmployerAlertsView';
import ApplicantManagement from './components/ApplicantManagement';
import PostJobFlow from './components/PostJobFlow';
import LandingPage from './components/LandingPage';
import ApplicationsView from './components/ApplicationsView';
import SavedJobsView from './components/SavedJobsView';
import DatabaseStatus from './components/DatabaseStatus';
import EmployerAnalytics from './components/EmployerAnalytics';
import SeekerAnalytics from './components/SeekerAnalytics';
import CommunityFeed from './components/CommunityFeed';
import ChatWindow from './components/ChatWindow';
import { fetchAdzunaJobs } from './services/adzunaService';
import { getJobMatches, analyzeResume, runFullRadarIntelligenceEngine } from './services/geminiService';
import { runRadarEngine, RadarExistingData } from './services/radarEngine';
import { MatchResult } from './types';
import { auth, db, syncUserProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query as firestoreQuery, where, doc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp as firestoreTimestamp, getDoc, addDoc, limit } from 'firebase/firestore';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let userUnsubscribe: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const savedRole = localStorage.getItem('role') as UserRole || 'JOB_SEEKER';
        await syncUserProfile(firebaseUser, savedRole);
        
        // Setup Firestore listener for user profile
        userUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            // Ensure profile strength starts at 1% if not present
            if (data.profileStrength === undefined) {
              data.profileStrength = 1;
              const userRef = doc.ref;
              updateDoc(userRef, { profileStrength: 1 }).catch(console.error);
            }
            setUser(data);
            setRole(data.role as UserRole);
            setIsLoggedIn(true);
          }
        }, (error) => {
          console.error("Profile snapshot error:", error);
        });
      } else {
        if (userUnsubscribe) {
          userUnsubscribe();
          userUnsubscribe = undefined;
        }
        setUser(null);
        setRole('GUEST');
        setIsLoggedIn(false);
      }
      setIsInitializing(false);
    });

    return () => {
      unsubscribeAuth();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(MOCK_JOBS);
  const [activeChat, setActiveChat] = useState<{ roomId: string; recipientName: string } | null>(null);

  // Sync Jobs from Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const seedInitialData = async () => {
      try {
        const jobsRef = collection(db, 'jobs');
        const snapshot = await getDoc(doc(db, 'system', 'seeded'));
        
        // If system hasn't been seeded, do it now
        if (!snapshot.exists()) {
          console.log("Seeding initial mock jobs to Firestore...");
          const { MOCK_JOBS } = await import('./constants');
          
          await Promise.all(MOCK_JOBS.map(async (job) => {
            await addDoc(jobsRef, {
              ...job,
              createdAt: firestoreTimestamp(),
              updatedAt: firestoreTimestamp()
            });
          }));
          
          // Mark as seeded
          await setDoc(doc(db, 'system', 'seeded'), {
            timestamp: firestoreTimestamp(),
            count: MOCK_JOBS.length
          });
          
          showToast(`Radar Initialized with ${MOCK_JOBS.length} regional jobs!`, 'INFO');
        }
      } catch (e) {
        console.error("Seeding error:", e);
      }
    };

    try {
      const q = firestoreQuery(collection(db, 'jobs'), limit(100));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const dbJobs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Job));
        if (dbJobs.length > 0) {
          setJobs(dbJobs);
        } else {
          // If no jobs at all, seed the constants
          seedInitialData();
        }
      }, (error) => {
        console.error("Jobs snapshot error:", error);
      });
    } catch (err) {
      console.error("Snapshot setup error:", err);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lastAppliedJob, setLastAppliedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'MAP' | 'PROFILE' | 'ALERTS' | 'EMPLOYER' | 'ADMIN' | 'APPLICANTS' | 'POST_JOB' | 'APPLICATIONS_TRACKER' | 'SAVED_JOBS' | 'ANALYTICS' | 'SEEKER_ANALYTICS' | 'COMMUNITY'>(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole === 'EMPLOYER') return 'EMPLOYER';
    if (savedRole === 'ADMIN') return 'ADMIN';
    return 'MAP';
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(() => {
    const saved = localStorage.getItem('locationEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [jobMatches, setJobMatches] = useState<MatchResult[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'SUCCESS' | 'INFO' | 'ERROR' } | null>(null);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('role', role);
    localStorage.setItem('userProfile', JSON.stringify(user));
    localStorage.setItem('locationEnabled', JSON.stringify(locationEnabled));
  }, [isLoggedIn, role, user, locationEnabled]);

  const showToast = (message: string, type: 'SUCCESS' | 'INFO' | 'ERROR' = 'SUCCESS') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFetchLiveJobs = async () => {
    setIsFetchingLive(true);
    try {
      const queryText = filters.query || "Software Engineer";
      const areaText = user?.location?.area || "Chennai";
      const liveJobs = await fetchAdzunaJobs(queryText, areaText);
      
      if (liveJobs.length > 0) {
        // Prepare batch for Firestore (using individual adds for simplicity in this flow)
        const jobsRef = collection(db, 'jobs');
        
        // Use a promise pool or simple loop to save to DB
        // We only save if they are new (handled by logic later or just adding)
        await Promise.all(liveJobs.map(async (job) => {
          try {
            // Check if job ID already exists in our state to avoid redundant DB writes during THIS session
            const exists = jobs.some(j => j.id === job.id);
            if (!exists) {
              await addDoc(jobsRef, {
                ...job,
                source: 'adzuna',
                createdAt: firestoreTimestamp(),
                updatedAt: firestoreTimestamp()
              });
            }
          } catch (e) {
            console.warn("Failed to save live job to DB:", job.id);
          }
        }));

        showToast(`Successfully fetched ${liveJobs.length} live jobs. Radar updated!`, 'SUCCESS');
      } else {
        showToast('No live jobs found for your search.', 'INFO');
      }
    } catch (error) {
      console.error("Failed to fetch live jobs:", error);
      showToast('Failed to connect to Adzuna API.', 'ERROR');
    } finally {
      setIsFetchingLive(false);
    }
  };

  const handleAIScan = async () => {
    if (!user) {
      showToast('Please login for AI scan', 'ERROR');
      return;
    }
    setIsScanning(true);
    try {
      if (!user) return;
      
      const radarContext: RadarExistingData = {
        profile: user,
        skills: user.skills || [],
        resume_data: user.resumeAnalysis || {},
        saved_jobs: user.savedJobs || [],
        applied_jobs: (user.applications || []).map(a => a.jobId)
      };

      const result = await runRadarEngine(radarContext, {
        intent: "alert_check",
        input: filteredJobs
      });

      if (result.intent === 'alert_check' && result.notify) {
        showToast(result.reason, 'INFO');
      }

      const matches = await getJobMatches(user, filteredJobs);
      setJobMatches(matches);
      
      if (matches.length > 0) {
        showToast(`AI Radar Scan completed: ${matches.length} matches found.`, 'SUCCESS');
      }
    } catch (error) {
      showToast('AI Radar Scan failed.', 'ERROR');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      
      // Merge updates locally for engine context
      const mergedProfile = { ...user, ...updates };

      // Step: Run Intelligence Engine on every profile update
      const marketData = {
        jobs: jobs.slice(0, 5), // Samples for context
        top_skills: ["React", "TypeScript", "Node.js", "Python", "Java", "Angular", "Vue", "AWS", "Azure"],
        salary_trends: { "IT": "₹ 6L - 25L", "LOCAL": "₹ 2L - 6L" },
        demand_levels: { "IT": "Very High", "LOCAL": "Stable" }
      };
      
      const intelligence = await runFullRadarIntelligenceEngine(mergedProfile, marketData, `Update: ${JSON.stringify(updates)}`);
      
      const finalUpdates = {
        ...updates,
        ...intelligence.updated_profile,
        profileStrength: intelligence.profile_strength,
        fullReport: intelligence,
        updatedAt: firestoreTimestamp()
      };

      await updateDoc(userRef, finalUpdates);
      showToast('Intelligence Pulse: Profile synchronized and optimized!', 'SUCCESS');
    } catch (err) {
      console.error("Profile update error:", err);
      showToast('Failed to sync profile. Check connection.', 'ERROR');
    }
  };

  const handleResumeUpload = async (text: string) => {
    if (!user) return;
    setIsScanning(true);
    try {
      const analysis = await analyzeResume(text);
      
      const marketData = {
        jobs: jobs.slice(0, 5),
        top_skills: ["React", "TypeScript", "Node.js", "Python", "Java", "Angular", "Vue", "AWS", "Azure"],
        salary_trends: { "IT": "₹ 6L - 25L", "LOCAL": "₹ 2L - 6L" },
        demand_levels: { "IT": "Very High", "LOCAL": "Stable" }
      };

      const intelligence = await runFullRadarIntelligenceEngine(
        { ...user, skills: Array.from(new Set([...(user.skills || []), ...analysis.extractedSkills])) },
        marketData,
        "Resume Upload"
      );
      
      const updatedProfile: Partial<UserProfile> = {
        skills: Array.from(new Set([...(user.skills || []), ...analysis.extractedSkills])),
        resumeAnalysis: {
          ...analysis,
          experience: analysis.experience.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) })),
          education: analysis.education.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) }))
        },
        experience: analysis.experience.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) })),
        education: analysis.education.map((e: any) => ({ ...e, id: Math.random().toString(36).substr(2, 9) })),
        bio: analysis.summary,
        profileStrength: intelligence.profile_strength || Math.max(analysis.atsScore, 65),
        aiVerified: true,
        resumeText: text,
        fullReport: intelligence,
        updatedAt: firestoreTimestamp()
      };
      
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updatedProfile);
      
      setUser(prev => prev ? ({ ...prev, ...updatedProfile }) : null);
      showToast(`AI Intelligence Analysis Combined with Market Pulse! Strength: ${updatedProfile.profileStrength}%`, 'SUCCESS');
    } catch (error) {
      console.error("Profile AI Analysis Error:", error);
      showToast('AI Intelligence Analysis failed. Checking session...', 'ERROR');
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to calculate distance in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const [filters, setFilters] = useState({
    query: '',
    radius: 50, // Default to 50km for Tamil Nadu scope
    category: 'ALL' as JobCategory | 'ALL',
    urgentOnly: false
  });

  useEffect(() => {
    let result = jobs.filter(j => role === 'ADMIN' ? true : j.status === 'OPEN');
    
    // Apply distance filter if location is enabled
    if (locationEnabled && user?.location) {
      result = result.filter(j => {
        const dist = getDistance(user.location!.lat, user.location!.lng, j.location.lat, j.location.lng);
        return dist <= filters.radius;
      });
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.company.toLowerCase().includes(q) ||
        j.location.area.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'ALL') {
      result = result.filter(j => j.category === filters.category);
    }
    if (filters.urgentOnly) {
      result = result.filter(j => j.urgent);
    }
    setFilteredJobs(result);
  }, [filters, jobs, locationEnabled, user?.location, role]);

  const handleApply = async (job: Job) => {
    if (!user) {
      showToast('Please login to apply', 'ERROR');
      return;
    }
    
    try {
      const appRef = collection(db, 'applications');
      const applicationData = {
        jobId: job.id,
        seekerId: user.id,
        employerId: job.employerId || 'mock_employer',
        appliedDate: new Date().toISOString(),
        status: 'APPLIED' as ApplicationStatus,
        seekerName: user.name,
        jobTitle: job.title,
        company: job.company
      };
      
      const docRef = await addDoc(appRef, applicationData);
      
      // Also update user's own application history for the tracker view
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        applications: arrayUnion({
          id: docRef.id,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          appliedDate: applicationData.appliedDate,
          status: 'APPLIED'
        })
      });

      setLastAppliedJob(job);
      setActiveJob(null);
      setShowDetailsModal(false);
      showToast(`Pulse sent to ${job.company}!`, 'SUCCESS');
    } catch (e) {
      console.error(e);
      showToast('Application failed to send', 'ERROR');
    }
  };

  const handleToggleSave = async (jobId: string) => {
    if (!user) {
      showToast('Please login to save jobs', 'ERROR');
      return;
    }
    const saved = user.savedJobs || [];
    const isSaved = saved.includes(jobId);
    const userRef = doc(db, 'users', user.id);
    
    try {
      await updateDoc(userRef, {
        savedJobs: isSaved ? arrayRemove(jobId) : arrayUnion(jobId)
      });
      showToast(isSaved ? 'Job removed from radar' : 'Job pinned to your radar!', 'SUCCESS');
    } catch (e) {
      showToast('Failed to update saved jobs', 'ERROR');
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === 'GUEST') {
      try {
        await auth.signOut();
        localStorage.removeItem('role');
        showToast('Logged out successfully', 'INFO');
      } catch (error) {
        showToast('Logout failed', 'ERROR');
      }
      return;
    }

    if (user) {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: newRole });
    }
    setRole(newRole);
    if (newRole === 'EMPLOYER') setView('EMPLOYER');
    else if (newRole === 'ADMIN') setView('ADMIN');
    else setView('MAP');
  };

  const handleLogin = async (selectedRole: UserRole, email: string) => {
    // We now rely purely on real Firebase Auth. 
    // The LandingPage UI will trigger signInWithGoogle, which triggers onAuthStateChanged.
    // If they typed credentials, we just save the pending role temporarily.
    localStorage.setItem('role', selectedRole);
  };

  const handleInitiateChat = async (recipientId: string, recipientName: string) => {
    if (!user) {
      showToast('Please login to chat', 'ERROR');
      return;
    }
    const roomId = [user.id, recipientId].sort().join('_');
    const roomRef = doc(db, 'rooms', roomId);
    
    try {
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        await setDoc(roomRef, {
          id: roomId,
          participants: [user.id, recipientId],
          updatedAt: firestoreTimestamp(),
          recipientName: recipientName
        });
      }

      setActiveChat({ roomId, recipientName });
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Chat initiation error:", error);
      showToast('Connection to chat server lost.', 'ERROR');
    }
  };

  const handleLocationSelect = (loc: { lat: number; lng: number; area: string }) => {
    setUser(prev => ({ ...prev, location: loc }));
    setLocationEnabled(true);
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (!locationEnabled && view === 'MAP' && role === 'JOB_SEEKER') {
    return <LocationSelection onSelect={handleLocationSelect} />;
  }

  const handleUpdateStatus = async (jobId: string, status: 'OPEN' | 'CLOSED') => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { status });
      showToast(`Radar visibility ${status === 'OPEN' ? 'restored' : 'paused'}.`, 'SUCCESS');
    } catch (e) {
      showToast('Failed to update status', 'ERROR');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to deactivate this broadcast permanently?')) {
      try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, { status: 'DELETED' });
        showToast('Role deactivated and removed from radar.', 'INFO');
      } catch (e) {
        showToast('Failed to delete job', 'ERROR');
      }
    }
  };

  const handlePostJob = async (jobData: any) => {
    if (!user) return;
    try {
      if (editingJob) {
        const jobRef = doc(db, 'jobs', editingJob.id);
        await updateDoc(jobRef, {
          ...jobData,
          status: 'PENDING',
          updatedAt: firestoreTimestamp()
        });
        showToast('Update sent to moderation queue!', 'SUCCESS');
      } else {
        const jobsRef = collection(db, 'jobs');
        await addDoc(jobsRef, {
          ...jobData,
          employerId: user.id,
          createdAt: firestoreTimestamp(),
          updatedAt: firestoreTimestamp(),
          status: 'PENDING',
          applications_count: 0
        });
        showToast('Role sent to moderation queue!', 'SUCCESS');
      }
      setEditingJob(null);
      setView('EMPLOYER');
    } catch (e) {
      console.error(e);
      showToast('Transmission failed. Check connection.', 'ERROR');
    }
  };

  const handleViewChange = (newView: any, data?: any) => {
    if (newView === 'POST_JOB') {
      setEditingJob(data || null);
    }
    setView(newView);
    setShowMobileSidebar(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <Header 
        role={role} 
        user={user}
        onRoleChange={handleRoleChange} 
        view={view} 
        setView={handleViewChange} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showToast={showToast}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onCloseSidebar={() => setShowMobileSidebar(false)}
      />

      <main className="flex-1 flex relative overflow-hidden">
        {/* Persistent Sidebar for Seekers & Employers */}
        <AnimatePresence>
          {(role === 'JOB_SEEKER' || role === 'EMPLOYER') && (
            <>
              {/* Mobile Sidebar Overlay/Backdrop */}
              {showMobileSidebar && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileSidebar(false)}
                  className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900]"
                />
              )}
              
              <aside className={`${showMobileSidebar ? 'fixed inset-y-0 left-0 w-80 z-[1000] flex animate-slide-in-left' : 'hidden lg:flex'} w-80 flex-col shrink-0 transition-all duration-300 relative z-40 bg-slate-50 dark:bg-slate-950 lg:bg-transparent`}>
                <div className="flex-1 m-6 mt-32 mb-6 p-6 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                  <div className="flex lg:hidden justify-between items-center mb-6">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Navigation</span>
                    <button onClick={() => setShowMobileSidebar(false)} className="text-slate-400">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  {role === 'JOB_SEEKER' ? (
                    <div className="pb-6 border-b border-slate-100/50 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Discovery</h2>
                          <DatabaseStatus />
                      </div>
                      <p className="text-[10px] font-black text-[#0f998b] dark:text-teal-400 uppercase tracking-widest leading-none">Live in {user?.location?.area}</p>
                      
                      <button 
                        onClick={handleFetchLiveJobs}
                        disabled={isFetchingLive}
                        className={`mt-10 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg ${
                          isFetchingLive 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-900 dark:bg-teal-600 text-white shadow-slate-900/10 dark:shadow-teal-900/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-base ${isFetchingLive ? 'animate-spin' : ''}`}>
                          {isFetchingLive ? 'sync' : 'travel_explore'}
                        </span>
                        <span>{isFetchingLive ? 'Fetching...' : 'Fetch Live'}</span>
                      </button>

                      <button 
                        onClick={handleAIScan}
                        disabled={isScanning}
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg border-2 ${
                          isScanning 
                            ? 'bg-slate-50 border-slate-100 text-slate-300 dark:bg-slate-800 dark:border-slate-700' 
                            : 'bg-white border-teal-500/20 text-teal-600 dark:bg-slate-900 dark:text-teal-400 hover:border-teal-500 hover:bg-teal-500/5'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${isScanning ? 'animate-spin' : ''}`}>
                          {isScanning ? 'sync' : 'auto_awesome'}
                        </span>
                        <span>{isScanning ? 'Scanning...' : 'AI Pulse Scan'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pb-6 border-b border-slate-100/50 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Employer Hub</h2>
                          <DatabaseStatus />
                      </div>
                      <p className="text-[10px] font-black text-[#0f998b] dark:text-teal-400 uppercase tracking-widest leading-none">Global Coverage Active</p>
                      
                      <button 
                        onClick={() => { setView('POST_JOB'); setShowMobileSidebar(false); }}
                        className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg bg-[#0f998b] text-white shadow-[#0f998b]/20 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        <span>Post New Job</span>
                      </button>
                    </div>
                  )}

                  <nav className="flex-1 py-6 space-y-2 overflow-y-auto mt-2">
                    {role === 'EMPLOYER' && (
                      <button onClick={() => { setView('EMPLOYER'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'EMPLOYER' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                         <span className={`material-symbols-outlined transition-transform ${view === 'EMPLOYER' ? 'scale-110' : 'group-hover:scale-110'}`}>dashboard</span>
                         <span className="tracking-tight">Home Base</span>
                      </button>
                    )}
                    
                    <button onClick={() => { setView('MAP'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'MAP' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                       <span className={`material-symbols-outlined transition-transform ${view === 'MAP' ? 'scale-110' : 'group-hover:scale-110'}`}>explore</span>
                       <span className="tracking-tight">Global View</span>
                    </button>

                    {role === 'JOB_SEEKER' && (
                      <>
                        <button onClick={() => { setView('SAVED_JOBS'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'SAVED_JOBS' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                           <span className={`material-symbols-outlined transition-transform ${view === 'SAVED_JOBS' ? 'scale-110' : 'group-hover:scale-110'}`}>favorite</span>
                           <span className="tracking-tight">Saved Goals</span>
                        </button>
                        <button onClick={() => { setView('APPLICATIONS_TRACKER'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'APPLICATIONS_TRACKER' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                           <span className={`material-symbols-outlined transition-transform ${view === 'APPLICATIONS_TRACKER' ? 'scale-110' : 'group-hover:scale-110'}`}>task_alt</span>
                           <span className="tracking-tight">History</span>
                        </button>
                        <button onClick={() => { setView('SEEKER_ANALYTICS'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'SEEKER_ANALYTICS' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                           <span className={`material-symbols-outlined transition-transform ${view === 'SEEKER_ANALYTICS' ? 'scale-110' : 'group-hover:scale-110'}`}>query_stats</span>
                           <span className="tracking-tight">Intelligence</span>
                        </button>
                      </>
                    )}

                    {role === 'EMPLOYER' && (
                      <>
                        <button onClick={() => { setView('APPLICANTS'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'APPLICANTS' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                           <span className={`material-symbols-outlined transition-transform ${view === 'APPLICANTS' ? 'scale-110' : 'group-hover:scale-110'}`}>groups</span>
                           <span className="tracking-tight">Applicants</span>
                        </button>
                        <button onClick={() => { setView('ANALYTICS'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'ANALYTICS' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                           <span className={`material-symbols-outlined transition-transform ${view === 'ANALYTICS' ? 'scale-110' : 'group-hover:scale-110'}`}>analytics</span>
                           <span className="tracking-tight">Analytics</span>
                        </button>
                      </>
                    )}

                    <button onClick={() => { setView('COMMUNITY'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'COMMUNITY' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                       <span className={`material-symbols-outlined transition-transform ${view === 'COMMUNITY' ? 'scale-110' : 'group-hover:scale-110'}`}>hub</span>
                       <span className="tracking-tight">Community</span>
                    </button>
                    <button onClick={() => { setView('ALERTS'); setShowMobileSidebar(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all group ${view === 'ALERTS' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                       <span className={`material-symbols-outlined transition-transform ${view === 'ALERTS' ? 'scale-110' : 'group-hover:scale-110'}`}>notifications</span>
                       <span className="tracking-tight">Alerts</span>
                       <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-sm">3</span>
                    </button>
                  </nav>
  
                  <div className="pt-6 border-t border-slate-100/50 dark:border-slate-800/50 flex flex-col gap-2">
                    <button 
                      onClick={() => { handleViewChange('PROFILE'); }} 
                      className={`w-full flex items-center gap-4 px-5 py-5 rounded-[2.5rem] font-black text-sm transition-all group/prof shadow-sm ${
                        view === 'PROFILE' 
                          ? 'bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-xl shadow-teal-500/10' 
                          : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:shadow-lg'
                      }`}
                    >
                        <div className={`size-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${view === 'PROFILE' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/40 rotate-12 scale-110' : 'bg-slate-100 dark:bg-slate-800 group-hover/prof:bg-teal-500/10 group-hover/prof:text-teal-600 group-hover/prof:-rotate-6'}`}>
                          <span className="material-symbols-outlined text-xl block">account_circle</span>
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className="tracking-tight leading-none mb-1">Preferences</span>
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">Global Settings</span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-700 group-hover/prof:translate-x-1 transition-transform" style={{ fontSize: '18px' }}>chevron_right</span>
                     </button>

                     <button 
                      onClick={() => handleRoleChange('GUEST')}
                      className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group"
                    >
                       <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">logout</span>
                       <span className="tracking-tight uppercase">Sign Out & Exit</span>
                    </button>
                  </div>
                </div>
              </aside>
            </>
          )}
        </AnimatePresence>

        <div className={`flex-1 flex flex-col overflow-hidden relative ${view !== 'MAP' ? 'pt-28' : ''}`}>
          {view === 'MAP' && (
            <div className="flex-1 relative z-0">
              <MapContainer 
                jobs={filteredJobs} 
                matches={jobMatches}
                isScanning={isScanning}
                onSelectJob={(job) => {
                  setActiveJob(job);
                  setShowDetailsModal(false); // Map click only previews/highlights
                }} 
                onViewDetails={(job) => {
                  setActiveJob(job);
                  setShowDetailsModal(true); // Explicit view details opens modal
                }}
                onLocationSelect={role === 'EMPLOYER' ? (lat, lng) => {
                  setView('POST_JOB');
                } : undefined}
                center={user?.location || CHENNAI_CENTER}
                radius={filters.radius}
                darkMode={darkMode}
                selectedJobId={activeJob?.id}
              />
              
              <div className="absolute top-28 left-4 right-4 z-[1000] max-w-lg mx-auto pointer-events-none sm:left-auto sm:right-10">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 pointer-events-auto border border-white/20 dark:border-slate-800/50 transition-all duration-300">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">search</span>
                      <input 
                        readOnly
                        onClick={() => setShowFilters(true)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm cursor-pointer dark:text-white dark:placeholder-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        placeholder="Search roles, skills, or area..."
                        value={filters.query}
                      />
                    </div>
                    <button 
                      onClick={() => setShowFilters(true)}
                      className="p-2 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined leading-none">tune</span>
                    </button>
                  </div>
                </div>
              </div>

              <BottomSheet 
                jobs={filteredJobs} 
                onSelectJob={(job) => {
                  setActiveJob(job);
                  setShowDetailsModal(true); // Bottom sheet click opens full details
                }} 
                onToggleSave={handleToggleSave}
                savedJobIds={user?.savedJobs || []}
                selectedJobId={activeJob?.id} 
              />
            </div>
          )}

          {view === 'ALERTS' && role === 'JOB_SEEKER' && <AlertsView onSelectJob={(job) => { setActiveJob(job); setView('MAP'); }} showToast={showToast} />}
          {view === 'ALERTS' && role === 'EMPLOYER' && <EmployerAlertsView jobs={jobs} user={user} showToast={showToast} />}
          {view === 'APPLICATIONS_TRACKER' && role === 'JOB_SEEKER' && <ApplicationsView applications={user?.applications || []} showToast={showToast} />}
          {view === 'SAVED_JOBS' && role === 'JOB_SEEKER' && (
            <SavedJobsView 
              jobs={jobs.filter(j => user?.savedJobs?.includes(j.id))} 
              onSelectJob={(job) => { setActiveJob(job); setShowDetailsModal(true); }}
              onRemove={handleToggleSave}
              showToast={showToast}
            />
          )}
          {view === 'SEEKER_ANALYTICS' && role === 'JOB_SEEKER' && user && <SeekerAnalytics user={user} jobs={jobs} onBack={() => handleViewChange('MAP')} />}
          {view === 'COMMUNITY' && <CommunityFeed />}
          {view === 'PROFILE' && role === 'JOB_SEEKER' && user && (
            <ProfileView 
              user={user} 
              setUser={setUser} 
              onNavigate={handleViewChange} 
              showToast={showToast} 
              onUpdateProfile={handleUpdateProfile}
              onResumeUpload={handleResumeUpload} 
            />
          )}
          {view === 'PROFILE' && role === 'ADMIN' && user && (
            <AdminSettings 
              user={user} 
              onBack={() => handleViewChange('ADMIN')} 
              showToast={showToast} 
            />
          )}
          {view === 'EMPLOYER' && role === 'EMPLOYER' && (
            <EmployerDashboard 
              user={user} 
              jobs={jobs} 
              onNavigate={handleViewChange} 
              onUpdateStatus={handleUpdateStatus}
              onDeleteJob={handleDeleteJob}
              showToast={showToast} 
            />
          )}
          {view === 'ANALYTICS' && role === 'EMPLOYER' && <EmployerAnalytics user={user} jobs={jobs} onBack={() => handleViewChange('EMPLOYER')} />}
          {view === 'APPLICANTS' && role === 'EMPLOYER' && <ApplicantManagement onBack={() => handleViewChange('EMPLOYER')} showToast={showToast} />}
          {view === 'POST_JOB' && role === 'EMPLOYER' && (
            <PostJobFlow 
              onCancel={() => handleViewChange('EMPLOYER')} 
              onFinish={handlePostJob} 
              showToast={showToast} 
              initialJob={editingJob}
              darkMode={darkMode}
            />
          )}
          {view === 'ADMIN' && role === 'ADMIN' && (
            <AdminPanel 
              jobs={jobs} 
              setJobs={setJobs} 
              role={role} 
              user={user} 
            />
          )}
        </div>

        {activeJob && showDetailsModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <JobDetails 
                job={activeJob} 
                onClose={() => setShowDetailsModal(false)} 
                onApply={() => handleApply(activeJob)}
                onInitiateChat={() => handleInitiateChat(activeJob.employerId || 'mock_employer', activeJob.company)}
                onToggleSave={handleToggleSave}
                onAdminAction={(id, status) => { handleUpdateStatus(id, status); setShowDetailsModal(false); showToast(`Job ${status === 'OPEN' ? 'Approved' : 'Rejected'}`); }}
                isSaved={user?.savedJobs?.includes(activeJob.id) || false}
                role={role}
                userSkills={user?.skills || []}
                darkMode={darkMode}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {activeChat && (
            <ChatWindow 
              roomId={activeChat.roomId} 
              recipientName={activeChat.recipientName} 
              onClose={() => setActiveChat(null)} 
            />
          )}
        </AnimatePresence>

        {lastAppliedJob && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <SuccessScreen 
                job={lastAppliedJob} 
                onClose={() => setLastAppliedJob(null)} 
                onTrack={() => { setLastAppliedJob(null); setView('APPLICATIONS_TRACKER'); }}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {showFilters && (
          <FilterOverlay 
            filters={filters} 
            setFilters={setFilters} 
            onClose={() => setShowFilters(false)} 
            userLocation={user?.location?.area || 'Tamil Nadu'}
          />
        )}
      </main>
    </div>
  );
};

export default App;
