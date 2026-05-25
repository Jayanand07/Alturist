"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

// ── COMPREHENSIVE LIST OF INDIAN CITIES WITH GEOLOCATIONS (FOR SORTING & PROXIMITY) ──────────────────
// This enables realistic sorting of doctors and clinics by actual distance from the selected city!
export interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const INDIAN_CITIES: CityInfo[] = [
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lng: 76.7794 },
  { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.8570 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 }
];

// Helper: Haversine distance between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

// Find closest Indian city to coordinates
export function getClosestCity(lat: number, lng: number): CityInfo {
  let closest = INDIAN_CITIES[0];
  let minDistance = calculateDistance(lat, lng, closest.lat, closest.lng);
  
  for (let i = 1; i < INDIAN_CITIES.length; i++) {
    const d = calculateDistance(lat, lng, INDIAN_CITIES[i].lat, INDIAN_CITIES[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = INDIAN_CITIES[i];
    }
  }
  return closest;
}

interface LocationStore {
  selectedCity: string;
  selectedState: string;
  selectedLat: number;
  selectedLng: number;
  gpsCoords: GpsCoordinates | null;
  isDetecting: boolean;
  
  setCity: (cityName: string) => void;
  detectLocation: (onSuccess?: (city: string) => void, onError?: (err: string) => void) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      selectedCity: "Amritsar",
      selectedState: "Punjab",
      selectedLat: 31.6340,
      selectedLng: 74.8723,
      gpsCoords: null,
      isDetecting: false,

      setCity: (cityName) => {
        const found = INDIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        if (found) {
          set({
            selectedCity: found.name,
            selectedState: found.state,
            selectedLat: found.lat,
            selectedLng: found.lng
          });
        } else {
          // If custom city, fallback to default national centroid (Delhi coords)
          set({
            selectedCity: cityName,
            selectedState: "India",
            selectedLat: 28.6139,
            selectedLng: 77.2090
          });
        }
      },

      detectLocation: (onSuccess, onError) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
          if (onError) onError("Geolocation is not supported by your browser");
          return;
        }

        set({ isDetecting: true });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const closest = getClosestCity(lat, lng);
            
            set({
              selectedCity: closest.name,
              selectedState: closest.state,
              selectedLat: closest.lat,
              selectedLng: closest.lng,
              gpsCoords: { latitude: lat, longitude: lng },
              isDetecting: false
            });

            if (onSuccess) onSuccess(closest.name);
          },
          (error) => {
            set({ isDetecting: false });
            let message = "Failed to detect location";
            if (error.code === error.PERMISSION_DENIED) {
              message = "Location permission denied. Please select your city manually.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              message = "Location information is unavailable.";
            } else if (error.code === error.TIMEOUT) {
              message = "Location request timed out.";
            }
            if (onError) onError(message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }),
    {
      name: 'altruist-location-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' 
          ? localStorage 
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
      )
    }
  )
);
