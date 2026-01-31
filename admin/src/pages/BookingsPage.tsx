import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Booking {
  _id: string;
  customerUserId: { fullName: string; email: string };
  providerId: { name: string };
  mode: 'HOME' | 'SALON';
  scheduledStart: string;
  scheduledEnd: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'ON_THE_WAY' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID';
  items: Array<{ providerServiceId: any; snapshots: { serviceName: string; price: number; durationMin: number } }>;
  createdAt: string;
}

export const BookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings-admin'],
    queryFn: async () => {
      const res = await api.get('/bookings/all');
      return res.data;
    }
  });

  const filteredBookings = bookings.filter(b => 
    statusFilter === 'all' || b.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      ON_THE_WAY: 'bg-indigo-100 text-indigo-700',
      STARTED: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REJECTED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || colors.PENDING;
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
        <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-500 mt-1">Manage all service bookings</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <label className="text-sm font-medium">Filter:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending ({bookings.filter(b => b.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setStatusFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Confirmed ({bookings.filter(b => b.status === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${statusFilter === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Completed ({bookings.filter(b => b.status === 'COMPLETED').length})
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Services</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold">{booking.customerUserId?.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.customerUserId?.email || ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{booking.providerId?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {booking.items?.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          {item.snapshots?.serviceName || 'Service'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.mode === 'HOME' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {booking.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{new Date(booking.scheduledStart).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-pink-600">Rs {booking.total?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.paymentStatus || 'N/A'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <i className="fa-solid fa-calendar-xmark text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};
