
import React, { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string; area: string }) => void;
  initialLocation?: { lat: number; lng: number };
  darkMode: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation, darkMode }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const defaultLocation = initialLocation || { lat: 13.0827, lng: 80.2707 }; // Chennai

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
      center: [defaultLocation.lng, defaultLocation.lat],
      zoom: 12,
      attributionControl: false
    });

    markerRef.current = new maplibregl.Marker({
      color: '#0f998b',
      draggable: true
    })
      .setLngLat([defaultLocation.lng, defaultLocation.lat])
      .addTo(mapRef.current);

    const updateLocation = async () => {
      const lngLat = markerRef.current.getLngLat();
      
      // Reverse geocode using Nominatim (free)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lngLat.lat}&lon=${lngLat.lng}`);
        const data = await response.json();
        const address = data.display_name;
        const area = data.address.suburb || data.address.neighbourhood || data.address.city_district || 'Chennai';
        
        onLocationSelect({
          lat: lngLat.lat,
          lng: lngLat.lng,
          address: address,
          area: area
        });
      } catch (err) {
        onLocationSelect({
          lat: lngLat.lat,
          lng: lngLat.lng,
          address: 'Custom Location',
          area: 'Chennai'
        });
      }
    };

    markerRef.current.on('dragend', updateLocation);
    mapRef.current.on('click', (e: any) => {
      markerRef.current.setLngLat(e.lngLat);
      updateLocation();
    });

    setLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [darkMode]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          markerRef.current.setLngLat([longitude, latitude]);
          
          // Trigger update
          const lngLat = { lat: latitude, lng: longitude };
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lngLat.lat}&lon=${lngLat.lng}`)
            .then(res => res.json())
            .then(data => {
              onLocationSelect({
                lat: lngLat.lat,
                lng: lngLat.lng,
                address: data.display_name,
                area: data.address.suburb || data.address.neighbourhood || data.address.city_district || 'Chennai'
              });
            });
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Pin exact business radar point</p>
        <button 
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">my_location</span>
          Use Current Location
        </button>
      </div>
      <div 
        ref={mapContainerRef}
        className="h-64 rounded-[32px] overflow-hidden relative border border-slate-100 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center italic">Drag marker or click map to set exact location</p>
    </div>
  );
};

export default LocationPicker;
