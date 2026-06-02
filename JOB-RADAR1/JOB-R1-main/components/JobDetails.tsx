
import React, { useState, useEffect, useRef } from 'react';
import { Job, JobCategory } from '../types';
import { matchSkills } from '../services/geminiService';

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
  onInitiateChat: () => void;
  onToggleSave: (jobId: string) => void;
  onAdminAction?: (id: string, action: 'OPEN' | 'REJECTED') => void;
  isSaved: boolean;
  role: string;
  userSkills: string[];
  darkMode: boolean;
  showToast: (msg: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onApply, onInitiateChat, onToggleSave, onAdminAction, isSaved, role, userSkills, darkMode, showToast }) => {
  const [matchResult, setMatchResult] = useState<{ score: number; feedback: string; actionableFeedback?: string[]; skillsMissing?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (role === 'JOB_SEEKER') {
      setLoading(true);
      const userResumeText = `I have experience in ${userSkills.join(', ')}. Based in Chennai.`;
      
      // Use the matchSkills service but also handle potential missing skills/feedback
      matchSkills(userResumeText, job).then(res => {
        // Enhance with more detailed logic if needed or use the service result directly
        setMatchResult(res as any);
        setLoading(false);
      });
    }
  }, [job, role, userSkills]);

  useEffect(() => {
    const maplibregl = (window as any).maplibregl;
    if (!maplibregl || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: darkMode 
        ? 'https://tiles.openfreemap.org/styles/dark'
        : 'https://tiles.openfreemap.org/styles/liberty',
      center: [job.location.lng, job.location.lat],
      zoom: 14,
      attributionControl: false
    });

    new maplibregl.Marker({ color: '#0f998b' })
      .setLngLat([job.location.lng, job.location.lat])
      .addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [job, darkMode]);

  const handleGetDirections = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const maplibregl = (window as any).maplibregl;

      try {
        // Fetch route from OSRM
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${job.location.lng},${job.location.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes.length) {
          showToast('Could not find a route');
          return;
        }

        const route = data.routes[0].geometry;

        if (mapRef.current) {
          // Add user marker
          new maplibregl.Marker({ color: '#4285F4' })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current);

          // Add route source and layer
          if (mapRef.current.getSource('route')) {
            mapRef.current.getSource('route').setData(route);
          } else {
            mapRef.current.addSource('route', {
              type: 'geojson',
              data: route
            });

            mapRef.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#0f998b',
                'line-width': 6,
                'line-opacity': 0.8
              }
            });
          }

          // Fit map to route
          const coordinates = route.coordinates;
          const bounds = coordinates.reduce((acc: any, coord: any) => {
            return acc.extend(coord);
          }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

          mapRef.current.fitBounds(bounds, {
            padding: 40,
            duration: 1000
          });

          showToast('Route calculated!');
        }
      } catch (error) {
        console.error('Routing error:', error);
        showToast('Error calculating route');
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      showToast('Please enable location access');
    });
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Main Content Area */}
      <div className="flex-1 overflow-visible bg-white dark:bg-slate-900 p-6 md:p-10 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex justify-between items-start mb-8">
           <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700 shrink-0 transition-colors duration-300">
                <img src={`https://picsum.photos/seed/${job.company}/100/100`} className="object-contain" alt="Logo" />
              </div>
              <div>
                 <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-1">{job.title}</h1>
                 <p className="text-teal-600 dark:text-teal-400 font-bold text-lg">{job.company} • <span className="text-slate-400 dark:text-slate-500">{job.location.area}, Chennai</span></p>
              </div>
           </div>
           <div className="flex gap-3">
             <button 
               onClick={() => onToggleSave(job.id)}
               className={`p-3 rounded-2xl border transition-all ${isSaved ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
               <span className={`material-symbols-outlined ${isSaved ? 'filled-icon' : ''}`}>
                 {isSaved ? 'favorite' : 'favorite_border'}
               </span>
             </button>
             <button onClick={onClose} className="md:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white">
               <span className="material-symbols-outlined">close</span>
             </button>
           </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
           <span className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border border-teal-100 dark:border-teal-800">
             <span className="material-symbols-outlined text-sm">distance</span> 4.2 km from T. Nagar
           </span>
           <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">
             <span className="material-symbols-outlined text-sm">payments</span> {job.salary}
           </span>
           <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border border-slate-100 dark:border-slate-700">
             <span className="material-symbols-outlined text-sm">schedule</span> Full-time
           </span>
        </div>

        <div className="space-y-8">
           <section>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">description</span> Role Description
              </h3>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed">
                 <p>{job.description}</p>
                 <h4 className="font-bold text-slate-900 dark:text-white mt-4">Key Responsibilities:</h4>
                 <ul className="list-disc pl-5 mt-2 space-y-1">
                   <li>Lead the technical evolution in our {job.location.area} hub.</li>
                   <li>Build reusable components and scalable libraries.</li>
                   <li>Optimize interfaces for maximum performance across devices.</li>
                 </ul>
              </div>
           </section>

           <section>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Required Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map(s => (
                  <span key={s} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400"></span> {s}
                  </span>
                ))}
              </div>
           </section>

           <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white mb-1">Office Location</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{job.location.address}, Chennai, TN</p>
                </div>
                <button 
                  onClick={handleGetDirections}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">directions</span>
                  Get Directions
                </button>
              </div>
              <div 
                ref={mapContainerRef}
                className="h-48 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 transition-colors duration-300"
              />
           </section>
        </div>
      </div>

      {/* Side Profile Match Panel (Desktop Only) */}
      <aside className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 p-6 md:p-8 shrink-0 flex flex-col transition-colors duration-300 overflow-visible">
        <button onClick={onClose} className="hidden md:flex self-end mb-6 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
           <span className="material-symbols-outlined">close</span>
        </button>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white">AI Match Score</h3>
                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[9px] font-black rounded uppercase">Optimal</span>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center py-10">
                   <div className="w-10 h-10 border-4 border-teal-600 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase">AI Matching...</p>
                </div>
              ) : matchResult ? (
                <div className="space-y-6">
                   <div className="flex flex-col items-center">
                      <div className="relative w-28 h-28 flex items-center justify-center rounded-full mb-4" style={{ background: `conic-gradient(#14b8a6 ${matchResult.score}%, ${darkMode ? '#1e293b' : '#e2e8f0'} 0)` }}>
                         <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center transition-colors duration-300">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{matchResult.score}%</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Match</span>
                         </div>
                      </div>
                      <p className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium px-2">{matchResult.feedback}</p>
                   </div>

                   {matchResult.skillsMissing && matchResult.skillsMissing.length > 0 && (
                     <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">Bridge the Gap</p>
                        <div className="flex flex-wrap gap-1.5">
                           {matchResult.skillsMissing.map(s => (
                             <span key={s} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded-md border border-amber-100 dark:border-amber-800 uppercase">{s}</span>
                           ))}
                        </div>
                     </div>
                   )}

                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">AI Recommendations</p>
                      <ul className="space-y-2">
                         {matchResult.actionableFeedback?.map((tip, i) => (
                           <li key={i} className="flex gap-2 items-start text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              <span className="material-symbols-outlined text-teal-500 text-xs mt-0.5">tips_and_updates</span>
                              {tip}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      {role === 'ADMIN' ? (
                        <div className="flex flex-col gap-3">
                           <button 
                             onClick={() => onAdminAction && onAdminAction(job.id, 'OPEN')}
                             className="w-full py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 dark:shadow-emerald-500/20 hover:scale-[1.03] transition-all text-xs uppercase flex items-center justify-center gap-2"
                           >
                             <span className="material-symbols-outlined text-lg">check_circle</span>
                             Approve Post
                           </button>
                           <button 
                             onClick={() => onAdminAction && onAdminAction(job.id, 'REJECTED')}
                             className="w-full py-4 bg-rose-600 dark:bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-600/20 dark:shadow-rose-500/20 hover:scale-[1.03] transition-all text-xs uppercase flex items-center justify-center gap-2"
                           >
                             <span className="material-symbols-outlined text-lg">block</span>
                             Reject Post
                           </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={onApply}
                            className="w-full py-4 bg-teal-600 dark:bg-teal-500 text-white font-black rounded-2xl shadow-xl shadow-teal-600/20 dark:shadow-teal-500/20 hover:scale-[1.03] transition-all mb-3 text-xs uppercase"
                          >
                            Apply Now
                          </button>
                          <button 
                            onClick={onInitiateChat}
                            className="w-full py-4 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-xs uppercase"
                          >
                            <span className="material-symbols-outlined text-lg">forum</span>
                            Direct Chat
                          </button>
                        </>
                      )}
                   </div>
                </div>
              ) : role === 'ADMIN' ? (
                <div className="py-10 text-center flex flex-col items-center">
                   <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                     <span className="material-symbols-outlined font-black">shield_person</span>
                   </div>
                   <p className="text-xs text-slate-800 dark:text-slate-200 font-black uppercase mb-2 tracking-widest">Admin Oversight</p>
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold px-4 mb-6 leading-relaxed">Review the posting details on the left. You can override the status of this job directly from the map radar.</p>
                   
                   <div className="w-full flex gap-3 px-2">
                     <button 
                       onClick={() => onAdminAction && onAdminAction(job.id, 'OPEN')}
                       className="flex-1 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 dark:shadow-emerald-500/20 hover:scale-[1.03] transition-all text-[10px] uppercase flex flex-col items-center justify-center gap-1"
                     >
                       <span className="material-symbols-outlined text-sm">check_circle</span>
                       Approve
                     </button>
                     <button 
                       onClick={() => onAdminAction && onAdminAction(job.id, 'REJECTED')}
                       className="flex-1 py-4 bg-rose-600 dark:bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-600/20 dark:shadow-rose-500/20 hover:scale-[1.03] transition-all text-[10px] uppercase flex flex-col items-center justify-center gap-1"
                     >
                       <span className="material-symbols-outlined text-sm">block</span>
                       Reject
                     </button>
                   </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                   <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mb-4 tracking-widest">Login for AI Match</p>
                </div>
              )}
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                 <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/${job.company}/50/50`} className="w-full h-full object-cover" alt="Company" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{job.company}</h4>
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">{job.location.area}</p>
                 </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4">A premier technology hub in Chennai building enterprise systems.</p>
              <button 
                onClick={() => showToast('Company profile coming soon!')}
                className="text-teal-600 dark:text-teal-400 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                View Hub <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default JobDetails;
