import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Provider {
  _id: string;
  name: string;
  type: 'SALON' | 'INDIVIDUAL';
  city: string;
  addressLine?: string;
  phone?: string;
  description?: string;
  homeService: boolean;
  salonVisit: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  gallery: string[];
  avatar?: string;
  coverImage?: string;
  workingHours?: string;
  experience?: string;
  specialization?: string;
  instagram?: string;
  facebook?: string;
}

export const ProvidersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      try {
        const res = await api.get('/providers/admin/all');
        // Handle different response structures
        const data = Array.isArray(res.data) ? res.data : res.data?.providers || [];
        console.log('Providers data:', data);
        return data;
      } catch (error) {
        console.error('Providers fetch error:', error);
        return [];
      }
    }
  });

  const verifyMutation = useMutation({
    mutationFn: (providerId: string) => api.patch(`/providers/${providerId}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  const filteredProviders = providers.filter(p => {
    if (statusFilter === 'verified') return p.isVerified;
    if (statusFilter === 'pending') return !p.isVerified;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-pink-600"></i>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Providers</h1>
        <p className="text-gray-500 mt-1">Manage beauty service providers</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <label className="text-sm font-medium">Filter:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All ({providers.length})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'verified' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Verified ({providers.filter(p => p.isVerified).length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending ({providers.filter(p => !p.isVerified).length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
            {(provider.coverImage || provider.gallery?.[0]) ? (
              <div className="h-40 bg-gradient-to-r from-pink-500 to-purple-500 relative">
                <img 
                  src={(provider.coverImage || provider.gallery?.[0] || '').startsWith('http') 
                    ? (provider.coverImage || provider.gallery?.[0]) 
                    : `http://localhost:4000${provider.coverImage || provider.gallery?.[0]}`
                  } 
                  alt={provider.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {provider.isVerified && (
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg">
                    <i className="fa-solid fa-circle-check text-green-600 mr-1"></i>
                    <span className="text-sm font-bold">Verified</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center relative">
                <i className="fa-solid fa-store text-white text-4xl opacity-50"></i>
                {provider.isVerified && (
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg">
                    <i className="fa-solid fa-circle-check text-green-600 mr-1"></i>
                    <span className="text-sm font-bold">Verified</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2">{provider.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${provider.type === 'SALON' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {provider.type}
                  </span>
                  {provider.homeService && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <i className="fa-solid fa-home mr-1"></i>Home
                    </span>
                  )}
                  {provider.salonVisit && (
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                      <i className="fa-solid fa-store mr-1"></i>Salon
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{provider.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-star text-yellow-500"></i>
                    <span className="font-bold">{provider.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({provider.reviewCount || 0} reviews)</span>
                </div>
              </div>

              {!provider.isVerified && (
                <button
                  onClick={() => verifyMutation.mutate(provider._id)}
                  disabled={verifyMutation.isPending}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 mb-2"
                >
                  {verifyMutation.isPending ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Verifying...</>
                  ) : (
                    <><i className="fa-solid fa-check-circle mr-2"></i>Verify Provider</>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setSelectedProvider(provider)}
                className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-all"
              >
                <i className="fa-solid fa-eye mr-2"></i>View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-16">
          <i className="fa-solid fa-store text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No providers found</p>
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Cover Image */}
            {selectedProvider.coverImage && (
              <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-500 relative">
                <img 
                  src={selectedProvider.coverImage.startsWith('http') ? selectedProvider.coverImage : `http://localhost:4000${selectedProvider.coverImage}`} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Cover image failed:', selectedProvider.coverImage);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
              <div className="flex items-start gap-4 flex-1">
                {selectedProvider.avatar && (
                  <img 
                    src={selectedProvider.avatar.startsWith('http') ? selectedProvider.avatar : `http://localhost:4000${selectedProvider.avatar}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      console.log('Avatar failed:', selectedProvider.avatar);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedProvider.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProvider.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {selectedProvider.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {selectedProvider.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              {selectedProvider.description && (
                <div>
                  <h3 className="text-lg font-bold mb-3">About</h3>
                  <p className="text-gray-700">{selectedProvider.description}</p>
                </div>
              )}

              {/* Credentials */}
              <div>
                <h3 className="text-lg font-bold mb-3">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProvider.specialization && (
                    <div>
                      <label className="text-sm font-bold text-gray-600">Specialization</label>
                      <p className="text-gray-900">{selectedProvider.specialization}</p>
                    </div>
                  )}
                  {selectedProvider.experience && (
                    <div>
                      <label className="text-sm font-bold text-gray-600">Experience</label>
                      <p className="text-gray-900">{selectedProvider.experience}</p>
                    </div>
                  )}
                  {selectedProvider.workingHours && (
                    <div>
                      <label className="text-sm font-bold text-gray-600">Working Hours</label>
                      <p className="text-gray-900">{selectedProvider.workingHours}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold text-gray-600">Rating</label>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-star text-yellow-500"></i>
                      <span className="font-bold">{selectedProvider.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-500 text-sm">({selectedProvider.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProvider.phone && (
                    <div>
                      <label className="text-sm font-bold text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedProvider.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold text-gray-600">City</label>
                    <p className="text-gray-900">{selectedProvider.city}</p>
                  </div>
                  {selectedProvider.addressLine && (
                    <div className="col-span-2">
                      <label className="text-sm font-bold text-gray-600">Address</label>
                      <p className="text-gray-900">{selectedProvider.addressLine}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Modes */}
              <div>
                <h3 className="text-lg font-bold mb-3">Service Availability</h3>
                <div className="flex gap-3">
                  {selectedProvider.homeService && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
                      <i className="fa-solid fa-home mr-2"></i>Home Service
                    </span>
                  )}
                  {selectedProvider.salonVisit && (
                    <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-xl font-bold">
                      <i className="fa-solid fa-store mr-2"></i>Salon Visit
                    </span>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {(selectedProvider.instagram || selectedProvider.facebook) && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Social Media</h3>
                  <div className="flex gap-3">
                    {selectedProvider.instagram && (
                      <a
                        href={`https://instagram.com/${selectedProvider.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        <i className="fa-brands fa-instagram mr-2"></i>{selectedProvider.instagram}
                      </a>
                    )}
                    {selectedProvider.facebook && (
                      <a
                        href={selectedProvider.facebook.startsWith('http') ? selectedProvider.facebook : `https://${selectedProvider.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        <i className="fa-brands fa-facebook mr-2"></i>Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!selectedProvider.isVerified && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      verifyMutation.mutate(selectedProvider._id);
                      setSelectedProvider(null);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    <i className="fa-solid fa-check-circle mr-2"></i>Verify Provider
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
