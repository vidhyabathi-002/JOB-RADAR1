
import React, { useEffect, useRef, useState } from 'react';
import { Job, JobCategory, MatchResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MapContainerProps {
  jobs: Job[];
  matches?: MatchResult[];
  isScanning?: boolean;
  onSelectJob: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  center: { lat: number; lng: number };
  radius: number;
  darkMode: boolean;
  selectedJobId?: string;
}

type MapLayer = 'standard' | 'satellite' | 'terrain' | '3d';

const MapContainer: React.FC<MapContainerProps> = ({ jobs, matches, isScanning, onSelectJob, onViewDetails, onLocationSelect, center, radius, darkMode, selectedJobId }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any>(null);
  const clickedMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('standard');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const popupRef = useRef<any>(null);

  const createPopupHtml = (job: Job) => {
    const isIT = job.category === JobCategory.IT;
    return `
      <div class="p-4 w-72 font-sans bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 transition-all duration-300 relative overflow-hidden group/popup">
        <div class="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-12 -mt-12 opacity-50 blur-2xl"></div>
        
        <div class="flex items-start justify-between mb-4">
          <div class="flex flex-wrap gap-1.5">
            <span class="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest ${isIT ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50'}">
              ${job.category}
            </span>
            ${job.urgent ? `
              <span class="flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl tracking-widest bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 animate-pulse">
                <span class="material-symbols-outlined" style="font-size: 11px;">bolt</span>
                URGENT
              </span>
            ` : ''}
          </div>
          <p class="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1.5">Job Detail</p>
        </div>
        
        <h4 class="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 group-hover/popup:text-teal-600 dark:group-hover/popup:text-teal-400 transition-colors duration-300">${job.title}</h4>
        <div class="flex items-center gap-1.5 mb-5">
          <div class="size-5 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-slate-400" style="font-size: 12px;">apartment</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight line-clamp-1">${job.company} • ${job.location.area}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-2.5 mb-5">
          <div class="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <p class="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Salary</p>
            <p class="text-[13px] font-black text-slate-900 dark:text-white tracking-tight leading-none">${job.salary}</p>
          </div>
          <div class="bg-teal-50/50 dark:bg-teal-900/10 p-3 rounded-2xl border border-teal-100/30 dark:border-teal-800/30">
            <p class="text-[8px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest leading-none mb-1.5">Distance</p>
            <p class="text-[13px] font-black text-teal-700 dark:text-teal-400 tracking-tight leading-none">2.4 km</p>
          </div>
        </div>

        <div class="flex items-center justify-between pointer-events-none mb-4">
           <div class="flex items-center gap-1.5">
             <span class="material-symbols-outlined text-[10px] text-slate-400">schedule</span>
             <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Posted 2 days ago</p>
           </div>
           <div class="flex items-center gap-1.5">
             <span class="material-symbols-outlined text-[10px] text-teal-500">verified</span>
             <p class="text-[9px] font-bold text-teal-600/60 uppercase tracking-widest">Verified</p>
           </div>
        </div>

        <div class="flex items-center justify-between gap-3 pt-1">
          <button class="view-full-details-btn flex-[2_2_0%] bg-slate-900 dark:bg-teal-600 text-white text-[10px] px-4 py-3.5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-teal-600/20 transition-all flex items-center justify-center gap-2 group/btn" onclick="window.dispatchEvent(new CustomEvent('viewJob', {detail: '${job.id}'}))">
            View Details
            <span class="material-symbols-outlined transition-transform group-hover/btn:translate-x-0.5" style="font-size: 14px;">arrow_forward</span>
          </button>
          <button class="get-directions-btn size-11 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 rounded-2xl font-black hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all active:scale-95 flex items-center justify-center shadow-sm" title="Get Directions" onclick="window.dispatchEvent(new CustomEvent('getDirections', {detail: {lat: ${job.location.lat}, lng: ${job.location.lng}}}))">
            <span class="material-symbols-outlined" style="font-size: 20px;">near_me</span>
          </button>
        </div>
      </div>
    `;
  };

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const getStyleUrl = (layer: MapLayer, isDark: boolean) => {
    switch (layer) {
      case 'satellite':
        return {
          version: 8,
          sources: {
            'satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Tiles &copy; Esri'
            }
          },
          layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }]
        };
      case 'terrain':
        return 'https://tiles.openfreemap.org/styles/bright';
      case '3d':
      case 'standard':
      default:
        return isDark 
          ? 'https://tiles.openfreemap.org/styles/dark'
          : 'https://tiles.openfreemap.org/styles/liberty';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const maplibregl = (window as any).maplibregl;
    if (!maplibregl) return;

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: getStyleUrl(currentLayer, darkMode),
        center: [center.lng, center.lat],
        zoom: center.lat === 11.1271 ? 7 : 12,
        pitch: pitch,
        bearing: bearing,
        attributionControl: false,
        fadeDuration: 0, // Disable fade for faster initial load
        trackResize: true,
        antialias: true
      });

      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
      mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      mapRef.current.on('load', () => {
        setIsMapLoaded(true);
        
        // Add images for markers
        const addMarkerImage = async (id: string, color: string, icon: string) => {
          // Ensure font is loaded
          await document.fonts.load('32px "Material Symbols Outlined"');
          
          const size = 64;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw pin shape
          ctx.beginPath();
          ctx.moveTo(size/2, size);
          ctx.bezierCurveTo(size/4, size*0.75, 0, size/2, 0, size/2.5);
          ctx.arc(size/2, size/2.5, size/2, Math.PI, 0);
          ctx.bezierCurveTo(size, size/2, size*0.75, size*0.75, size/2, size);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Draw icon
          ctx.fillStyle = '#ffffff';
          ctx.font = '32px "Material Symbols Outlined"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, size/2, size/2.5);

          const imageData = ctx.getImageData(0, 0, size, size);
          mapRef.current.addImage(id, imageData);
        };

        addMarkerImage('marker-it', '#0f998b', 'computer');
        addMarkerImage('marker-local', '#E8A90F', 'storefront');
        addMarkerImage('marker-it-match', '#0f998b', 'auto_awesome');
        addMarkerImage('marker-local-match', '#E8A90F', 'auto_awesome');
        addMarkerImage('marker-pending', '#94a3b8', 'pending_actions');
        addMarkerImage('marker-rejected', '#e11d48', 'block');

        // Add 3D buildings if in 3D mode
        if (currentLayer === '3d') {
          const layers = mapRef.current.getStyle().layers;
          const labelLayerId = layers.find((l: any) => l.type === 'symbol' && l.layout['text-field'])?.id;
          
          mapRef.current.addLayer({
            'id': '3d-buildings',
            'source': 'openfreemap',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6
            }
          }, labelLayerId);
        }
      });

      mapRef.current.on('click', (e: any) => {
        // Check if we clicked a cluster or marker first
        const features = mapRef.current.queryRenderedFeatures(e.point, {
          layers: ['clusters', 'unclustered-point']
        });

        if (features.length > 0) {
          const feature = features[0];
          if (feature.layer.id === 'clusters') {
            const clusterId = feature.properties.cluster_id;
            mapRef.current.getSource('jobs').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
              if (err) return;
              mapRef.current.easeTo({
                center: feature.geometry.coordinates,
                zoom: zoom
              });
            });
            return;
          } else {
            // Unclustered point
            const job = JSON.parse(feature.properties.job);
            
            if (popupRef.current) popupRef.current.remove();
            
            // Trigger selection in App/Bottomsheet
            onSelectJob(job);
            
            popupRef.current = new maplibregl.Popup({ offset: [0, -32], closeButton: false, closeOnClick: true })
              .setLngLat(feature.geometry.coordinates)
              .setHTML(createPopupHtml(job))
              .addTo(mapRef.current);
            return;
          }
        }

        const { lng, lat } = e.lngLat;
        if (onLocationSelectRef.current) {
          const maplibregl = (window as any).maplibregl;
          // Handle map click for posting jobs
          if (!clickedMarkerRef.current) {
            const el = document.createElement('div');
            el.className = 'clicked-location-pin';
            el.innerHTML = '<span class="material-symbols-outlined" style="font-size: 32px; color: #0f998b; font-variation-settings: \'FILL\' 1;">push_pin</span>';
            
            clickedMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
          } else {
            clickedMarkerRef.current.setLngLat([lng, lat]);
          }

          new maplibregl.Popup({ offset: 25, closeButton: false })
            .setLngLat([lng, lat])
            .setHTML(`
              <div class="p-3 text-center bg-white dark:bg-slate-900 transition-colors duration-300">
                <p class="text-xs font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest leading-none">Selected Location</p>
                <button class="add-job-here-btn w-full py-2.5 bg-teal-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-teal-600/20 flex items-center justify-center leading-none" onclick="window.dispatchEvent(new CustomEvent('postJobAt', {detail: {lat: ${lat}, lng: ${lng}}}))">
                  Post Job Here
                </button>
              </div>
            `)
            .addTo(mapRef.current);
        }
      });

      // Change cursor on hover
      mapRef.current.on('mouseenter', 'clusters', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', 'clusters', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
      mapRef.current.on('mouseenter', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current.on('mouseleave', 'unclustered-point', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });

      // Listen for custom event from popup
      window.addEventListener('postJobAt', (e: any) => {
        if (onLocationSelectRef.current) onLocationSelectRef.current(e.detail.lat, e.detail.lng);
      });

      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (!userMarkerRef.current) {
              const el = document.createElement('div');
              el.className = 'user-location-pin';
              el.innerHTML = '<span class="material-symbols-outlined" style="font-size: 32px; color: #4285F4; font-variation-settings: \'FILL\' 1;">location_on</span><div class="user-pulse"></div>';
              
              userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([longitude, latitude])
                .addTo(mapRef.current);
            } else {
              userMarkerRef.current.setLngLat([longitude, latitude]);
            }
          },
          (error) => console.error("Location error:", error),
          { enableHighAccuracy: true }
        );
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getStyleUrl(currentLayer, darkMode), {
      diff: true, // Use diffing for faster style updates
      fadeDuration: 0
    });
    
    if (currentLayer === '3d') {
      setPitch(45);
      mapRef.current.setPitch(45);
    } else {
      setPitch(0);
      mapRef.current.setPitch(0);
    }
  }, [darkMode, currentLayer]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: center.lat === 11.1271 ? 7 : 12,
      essential: true
    });
  }, [center]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !center) return;

    const createCircleGeoJSON = (center: { lat: number; lng: number }, radiusInKm: number) => {
      const points = 64;
      const coords = {
        latitude: center.lat,
        longitude: center.lng
      };
      const distanceX = radiusInKm / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
      const distanceY = radiusInKm / 110.574;

      const ret = [];
      for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        ret.push([coords.longitude + x, coords.latitude + y]);
      }
      ret.push(ret[0]);

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ret]
        }
      };
    };

    const circleData = createCircleGeoJSON(center, radius) as any;

    if (mapRef.current.getSource('search-radius')) {
      const source = mapRef.current.getSource('search-radius');
      if (source && (source as any).setData) (source as any).setData(circleData);
    } else {
      mapRef.current.addSource('search-radius', {
        type: 'geojson',
        data: circleData
      });

      mapRef.current.addLayer({
        id: 'search-radius-fill',
        type: 'fill',
        source: 'search-radius',
        paint: {
          'fill-color': '#0f998b',
          'fill-opacity': 0.05
        }
      });

      mapRef.current.addLayer({
        id: 'search-radius-outline',
        type: 'line',
        source: 'search-radius',
        paint: {
          'line-color': '#0f998b',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.3
        }
      });
    }
  }, [center, radius, isMapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const geojson = {
      type: 'FeatureCollection',
      features: jobs.map(job => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [job.location.lng, job.location.lat]
        },
        properties: {
          id: job.id,
          category: job.category,
          urgent: job.urgent,
          status: job.status || 'OPEN',
          matchScore: matches?.find(m => m.jobId === job.id)?.matchScore || 0,
          job: JSON.stringify(job)
        }
      }))
    };

    if (mapRef.current.getSource('jobs')) {
      mapRef.current.getSource('jobs').setData(geojson);
    } else {
      mapRef.current.addSource('jobs', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        clusterProperties: {
          it_count: ['+', ['case', ['==', ['get', 'category'], JobCategory.IT], 1, 0]],
          local_count: ['+', ['case', ['==', ['get', 'category'], JobCategory.LOCAL], 1, 0]]
        }
      });

      mapRef.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'jobs',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>', ['get', 'it_count'], ['get', 'local_count']], '#0f998b',
            ['>', ['get', 'local_count'], ['get', 'it_count']], '#E8A90F',
            '#51bbd6'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      mapRef.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'jobs',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold'],
          'text-size': 12
        }
      });

      mapRef.current.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'jobs',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'case',
            ['==', ['get', 'status'], 'PENDING'],
            'marker-pending',
            ['==', ['get', 'status'], 'REJECTED'],
            'marker-rejected',
            ['>', ['get', 'matchScore'], 80],
            ['match', ['get', 'category'], JobCategory.IT, 'marker-it-match', 'marker-local-match'],
            ['match', ['get', 'category'], JobCategory.IT, 'marker-it', 'marker-local']
          ],
          'icon-size': 0.5,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true
        }
      });
    }

      // Listen for viewJob event
      const handleViewJob = (e: any) => {
        const job = jobs.find(j => j.id === e.detail);
        if (job) {
          if (onViewDetails) {
            onViewDetails(job);
          } else {
            onSelectJob(job);
          }
        }
      };

      const handleGetDirections = (e: any) => {
        const { lat, lng } = e.detail;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const maplibregl = (window as any).maplibregl;

          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${lng},${lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.code === 'Ok' && data.routes.length > 0) {
              const route = data.routes[0].geometry;

              if (mapRef.current) {
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
                  padding: 100,
                  duration: 1500
                });
              }
            }
          } catch (error) {
            console.error('Routing error:', error);
          }
        });
      };

      window.addEventListener('viewJob', handleViewJob);
      window.addEventListener('getDirections', handleGetDirections);

      return () => {
        window.removeEventListener('viewJob', handleViewJob);
        window.removeEventListener('getDirections', handleGetDirections);
        if (popupRef.current) popupRef.current.remove();
      };
  }, [jobs, matches, onSelectJob, onViewDetails, isMapLoaded]);

  // Handle visual selection animation
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId);
      if (job) {
        const maplibregl = (window as any).maplibregl;
        const el = document.createElement('div');
        el.className = 'custom-marker marker-selected';
        const color = job.category === JobCategory.IT ? '#0f998b' : '#E8A90F';
        const icon = job.category === JobCategory.IT ? 'computer' : 'storefront';
        
        el.innerHTML = `
          <div class="marker-pin ${job.category === JobCategory.IT ? 'marker-it' : 'marker-local'}" style="background: ${color};">
            <span class="material-symbols-outlined" style="font-size: 18px;">${icon}</span>
          </div>
          ${matches?.find(m => m.jobId === job.id && m.matchScore > 80) ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full animate-pulse shadow-lg flex items-center justify-center"><span class="material-symbols-outlined text-white" style="font-size: 8px;">auto_awesome</span></div>' : ''}
        `;
        
        selectedMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([job.location.lng, job.location.lat])
          .addTo(mapRef.current);
          
        mapRef.current.easeTo({
          center: [job.location.lng, job.location.lat],
          duration: 1000,
          padding: { bottom: 300 } // Space for bottom sheet
        });

        // Also show popup when selected via ID (e.g. from list)
        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new maplibregl.Popup({ offset: [0, -42], closeButton: false })
          .setLngLat([job.location.lng, job.location.lat])
          .setHTML(createPopupHtml(job))
          .addTo(mapRef.current);
      }
    }
  }, [selectedJobId, jobs, matches, isMapLoaded]);

  const handleRecenter = () => {
    if (mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const maplibregl = (window as any).maplibregl;

        // Ensure user marker exists and is updated
        if (!userMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'user-location-pin';
          el.innerHTML = '<span class="material-symbols-outlined" style="font-size: 32px; color: #4285F4; font-variation-settings: \'FILL\' 1;">location_on</span><div class="user-pulse"></div>';
          
          userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLngLat([longitude, latitude]);
        }

        // Add a temporary popup
        new maplibregl.Popup({ offset: 25, closeButton: false })
          .setLngLat([longitude, latitude])
          .setHTML('<div class="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">You are here</div>')
          .addTo(mapRef.current);

        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          essential: true,
          duration: 2000
        });
      }, (err) => {
        console.error("Recenter error:", err);
      }, { enableHighAccuracy: true });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-full group overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Scanning Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-teal-500/10 backdrop-blur-[2px] pointer-events-none flex items-center justify-center"
          >
            <div className="w-96 h-96 border-[40px] border-teal-500/20 rounded-full animate-ping" />
            <div className="absolute flex flex-col items-center">
               <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-teal-600/40">
                  <span className="material-symbols-outlined text-white text-3xl animate-bounce">radar</span>
               </div>
               <p className="mt-6 text-[11px] font-black text-teal-600 uppercase tracking-[0.3em] bg-white px-6 py-2 rounded-full shadow-lg">AI Match Scanning...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-500 animate-pulse">map</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse">
              Initializing High-Precision Map...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="relative">
          <button 
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
            title="Map Layers"
          >
            <span className="material-symbols-outlined">layers</span>
          </button>
          
          <AnimatePresence>
            {showLayerMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className="absolute right-14 top-0 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 flex flex-col gap-1 min-w-[140px]"
              >
                {[
                  { id: 'standard', label: 'Standard', icon: 'map' },
                  { id: 'satellite', label: 'Satellite', icon: 'satellite_alt' },
                  { id: 'terrain', label: 'Terrain', icon: 'terrain' },
                  { id: '3d', label: '3D View', icon: '3d_rotation' }
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setCurrentLayer(layer.id as MapLayer);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all leading-none ${
                      currentLayer === layer.id 
                        ? 'bg-teal-600 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg leading-none">{layer.icon}</span>
                    <span className="leading-none">{layer.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined leading-none">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
        </button>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={handleRecenter}
          className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95 recenter-btn-pulse"
          title="Recenter on my location"
        >
          <span className="material-symbols-outlined leading-none">my_location</span>
        </button>
      </div>

      {/* Map Scale/Info (Visual only) */}
      <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-lg">
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-60">
            {currentLayer} view • {jobs.length} jobs nearby
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
