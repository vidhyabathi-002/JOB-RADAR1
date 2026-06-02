
import React from 'react';

interface LocationSelectionProps {
  onSelect: (location: { lat: number; lng: number; area: string }) => void;
}

const LocationSelection: React.FC<LocationSelectionProps> = ({ onSelect }) => {
  const TN_CITIES = [
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { name: 'Trichy', lat: 10.7905, lng: 78.7047 },
    { name: 'Salem', lat: 11.6643, lng: 78.1460 },
    { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
    { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
    { name: 'Hosur', lat: 12.7409, lng: 77.8253 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-y-auto transition-colors duration-300">
       <header className="px-6 py-6 md:px-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
            <span className="material-symbols-outlined font-black text-3xl">radar</span>
            <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">Job Radar</h2>
          </div>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-20">
          <div className="max-w-2xl w-full text-center">
             <div className="relative inline-block mb-10">
                <div className="w-40 h-40 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 scale-125 transition-colors">
                   <span className="material-symbols-outlined !text-7xl animate-pulse">location_on</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-lg border border-teal-100 dark:border-teal-800 flex items-center gap-2 transition-colors">
                   <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tamil Nadu Hub</span>
                </div>
             </div>

             <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">Explore Jobs Across Tamil Nadu</h1>
             <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                From the IT corridors of Chennai to the textile hubs of Coimbatore. Select a city or search manually to start exploring real-time opportunities.
             </p>

             <div className="bg-slate-50 dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm mb-10 transition-colors">
                <div className="relative mb-8 group">
                   <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400">search</span>
                   <input 
                     className="w-full pl-12 pr-4 py-5 bg-white dark:bg-slate-800 border-none rounded-3xl text-lg font-black shadow-inner focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/30 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                     placeholder="Search city or neighborhood..."
                   />
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Major Hubs</p>
                   <div className="flex flex-wrap justify-center gap-2">
                      {TN_CITIES.map(city => (
                        <button 
                          key={city.name}
                          onClick={() => onSelect({ lat: city.lat, lng: city.lng, area: city.name })}
                          className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 hover:border-teal-600 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-sm active:scale-95"
                        >
                          {city.name}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => onSelect({ lat: 13.0827, lng: 80.2707, area: 'Chennai' })}
                  className="px-10 py-5 bg-teal-600 dark:bg-teal-500 text-white rounded-3xl font-black shadow-2xl shadow-teal-600/30 dark:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Focus on Chennai
                </button>
                <button 
                  onClick={() => onSelect({ lat: 11.1271, lng: 78.6569, area: 'Tamil Nadu' })}
                  className="px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl font-black shadow-2xl shadow-slate-900/20 dark:shadow-slate-800/20 hover:scale-105 active:scale-95 transition-all"
                >
                  View All Regions
                </button>
             </div>
          </div>
       </main>
       
       <div className="h-40 w-full opacity-10 pointer-events-none grayscale mt-auto">
          <img src="https://picsum.photos/seed/tamilnadu-map/2000/400" className="w-full h-full object-cover" alt="Tamil Nadu Map" />
       </div>
    </div>
  );
};

export default LocationSelection;
