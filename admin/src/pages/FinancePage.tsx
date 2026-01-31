import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface Stats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  completedBookings: number;
}

export const FinancePage: React.FC = () => {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['finance-stats'],
    queryFn: async () => {
      // In real app, create finance stats endpoint
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayouts: 0,
        completedBookings: 0
      };
    }
  });

  const revenueCards = [
    { 
      label: 'Total Revenue', 
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, 
      icon: 'fa-dollar-sign',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      label: 'This Month', 
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`, 
      icon: 'fa-calendar',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      label: 'Pending Payouts', 
      value: `$${stats?.pendingPayouts?.toLocaleString() || 0}`, 
      icon: 'fa-clock',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      label: 'Completed Bookings', 
      value: stats?.completedBookings || 0, 
      icon: 'fa-check-circle',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Finance & Revenue</h1>
        <p className="text-gray-500 mt-1">Track earnings, payouts, and financial metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {revenueCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <i className={`fa-solid ${card.icon} text-white text-xl`}></i>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-arrow-down text-green-600"></i>
                </div>
                <div>
                  <p className="font-bold">Booking Payment</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+$50.00</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-arrow-up text-red-600"></i>
                </div>
                <div>
                  <p className="font-bold">Provider Payout</p>
                  <p className="text-sm text-gray-500">5 hours ago</p>
                </div>
              </div>
              <span className="font-bold text-red-600">-$40.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Pending Payouts</h2>
          <div className="space-y-3">
            {/* Dummy Glamour Studio entry removed */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-6">
        <h2 className="text-xl font-bold mb-4">Revenue Chart</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <i className="fa-solid fa-chart-line text-6xl mb-4"></i>
            <p>Chart visualization placeholder</p>
            <p className="text-sm">Integrate Chart.js or Recharts for revenue trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};
