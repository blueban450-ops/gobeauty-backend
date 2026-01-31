import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Category {
  _id: string;
  name: string;
  icon: string;
}

interface Service {
  _id: string;
  name: string;
  categoryId: { _id: string; name: string; icon: string };
  baseDurationMin: number;
}

interface ProviderService {
  _id: string;
  serviceId: { _id: string; name: string; categoryId: any };
  customName?: string;
  description?: string;
  thumbnail?: string;
  price: number;
  durationMin: number;
  homeService: boolean;
  salonVisit: boolean;
  isActive: boolean;
  providerId: any;
}

export const ServicesPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'providers'>('catalog');
  const [workingHours, setWorkingHours] = useState('');
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    }
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const { data: providerServices = [] } = useQuery<ProviderService[]>({
    queryKey: ['admin-provider-services'],
    queryFn: async () => {
      const res = await api.get('/admin/provider-services');
      return Array.isArray(res.data) ? res.data : res.data?.services || [];
    }
  });


  // Mutation for toggling service status
  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/provider-services/${id}/status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-provider-services'] });
    },
    onError: (error: any) => {
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
  });

  const mutation = useMutation({
    mutationFn: (data: { name: string; categoryId: string; workingHours: string }) => 
      api.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setName('');
      setCategoryId('');
      setWorkingHours('');
      setIsOpen(false);
      alert('Service added successfully!');
    },
    onError: (error: any) => {
      console.error('Error adding service:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add service';
      alert('Error: ' + errorMessage);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      categoryId,
      workingHours
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-pink-600"></i>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 mt-1">Manage services and provider offerings</p>
        </div>
        {activeTab === 'catalog' && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Add Service
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 flex">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-3 px-4 font-bold rounded-l-xl transition-all ${
            activeTab === 'catalog'
              ? 'bg-pink-100 text-pink-600 border-b-2 border-pink-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <i className="fa-solid fa-concierge-bell mr-2"></i>Catalog Services
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`flex-1 py-3 px-4 font-bold rounded-r-xl transition-all ${
            activeTab === 'providers'
              ? 'bg-pink-100 text-pink-600 border-b-2 border-pink-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <i className="fa-solid fa-store mr-2"></i>Provider Services
        </button>
      </div>

      {/* Catalog Services Tab */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{svc.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <i className={`fa-solid fa-${svc.categoryId?.icon} text-pink-600`}></i>
                    </div>
                    <span>{svc.categoryId?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provider Services Tab */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Service</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {providerServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <i className="fa-solid fa-inbox text-3xl text-gray-300 mb-2"></i>
                    <p className="mt-2">No provider services added yet</p>
                  </td>
                </tr>
              ) : (
                providerServices.map((ps) => (
                  <tr key={ps._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ps.providerId?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{ps.providerId?.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ps.customName || ps.serviceId?.name}</div>
                      {ps.description && <div className="text-sm text-gray-500 line-clamp-2">{ps.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">Rs {ps.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{ps.durationMin} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {ps.homeService && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Home</span>}
                        {ps.salonVisit && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Salon</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ps.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ps.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        className={`ml-3 px-2 py-1 rounded text-xs font-bold border ${ps.isActive ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}
                        onClick={() => statusMutation.mutate({ id: ps._id, isActive: !ps.isActive })}
                        disabled={statusMutation.isPending}
                        title={ps.isActive ? 'Inactivate Service' : 'Activate Service'}
                      >
                        {ps.isActive ? 'Inactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'catalog' && services.length === 0 && (
        <div className="text-center py-16">
          <i className="fa-solid fa-concierge-bell text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No services added yet</p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700"
          >
            Add First Service
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Service</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="e.g., Relaxing Massage"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Working Hours</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="e.g., 10:00 AM - 6:00 PM"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 px-4 py-3 text-white rounded-xl font-bold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
                >
                  {mutation.isPending ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
