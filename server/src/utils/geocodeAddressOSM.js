// OpenStreetMap (Nominatim) se address ko lat/lng me convert karne ka helper
// Usage: await geocodeAddressOSM('address, city')
import axios from 'axios';

export async function geocodeAddressOSM(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await axios.get(url, { headers: { 'User-Agent': 'GoBeautyApp/1.0' } });
    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}
