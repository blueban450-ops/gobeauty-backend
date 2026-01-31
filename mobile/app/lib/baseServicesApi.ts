import api from '../lib/api';

export const fetchBaseServices = async () => {
  // Get all base services (admin-defined)
  const res = await api.get('/services');
  return res.data;
};
