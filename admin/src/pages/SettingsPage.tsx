import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Settings {
  _id: string;
  commissionRate: number;
}

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [commissionRate, setCommissionRate] = useState('');

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      setCommissionRate((res.data?.commissionRate || 12).toString());
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: { commissionRate: number }) => 
      api.patch('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ commissionRate: parseFloat(commissionRate) });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform settings</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Commission Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Platform Commission Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="12.0"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This percentage will be deducted from each completed booking
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-info-circle text-blue-600 mt-1"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-bold mb-1">How it works:</p>
                  <p>When a booking is marked as completed, the platform automatically calculates and deducts the commission from the provider's earnings.</p>
                </div>
              </div>
            </div>

            {settings && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Rate</span>
                  <span className="text-2xl font-bold text-pink-600">{settings.commissionRate}%</span>
                </div>
                <div className="text-sm text-gray-500">
                  Example: On a Rs 1,000 booking, platform earns Rs {(1000 * settings.commissionRate / 100).toFixed(0)}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full px-6 py-3 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
            >
              {mutation.isPending ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
              ) : (
                <><i className="fa-solid fa-save mr-2"></i>Save Settings</>
              )}
            </button>

            {mutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                <i className="fa-solid fa-check-circle mr-2"></i>
                Settings saved successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
