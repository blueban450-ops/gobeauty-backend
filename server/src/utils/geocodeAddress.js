// Google Maps Geocoding API se address ko lat/lng me convert karne ka helper
// Usage: await geocodeAddress('address, city', 'YOUR_GOOGLE_API_KEY')
import axios from 'axios';

export async function geocodeAddress(address: string, apiKey: string): Promise<{lat: number, lng: number} | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await axios.get(url);
    if (res.data.status === 'OK' && res.data.results.length > 0) {
      const loc = res.data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch (e) {
    return null;
  }
}
