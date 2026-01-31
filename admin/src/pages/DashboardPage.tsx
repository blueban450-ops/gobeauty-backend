import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface Stats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalCategories: number;
  totalServices: number;
  pendingProviders: number;
  todayBookings: number;
  totalRevenue: number;
}

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [users, providers, bookings, categories, services] = await Promise.all([
          api.get('/auth/users').catch(() => ({ data: [] })),
          api.get('/providers').catch(() => ({ data: { providers: [] } })),
          api.get('/bookings').catch(() => ({ data: { bookings: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/services').catch(() => ({ data: { services: [] } }))
        ]);
        
        // Handle different response structures
        const usersData = Array.isArray(users.data) ? users.data : users.data?.users || [];
        const providersData = Array.isArray(providers.data) ? providers.data : providers.data?.providers || [];
        const bookingsData = Array.isArray(bookings.data) ? bookings.data : bookings.data?.bookings || [];
        const categoriesData = Array.isArray(categories.data) ? categories.data : categories.data?.categories || [];
        const servicesData = Array.isArray(services.data) ? services.data : services.data?.services || [];
        
        const today = new Date().toDateString();
        
        return {
          totalUsers: usersData.length,
          totalProviders: providersData.length,
          totalBookings: bookingsData.length,
          totalCategories: categoriesData.length,
          totalServices: servicesData.length,
          pendingProviders: providersData.filter((p: any) => !p.isVerified).length,
          todayBookings: bookingsData.filter((b: any) => 
            new Date(b.createdAt).toDateString() === today
          ).length,
          totalRevenue: bookingsData
            .filter((b: any) => b.status === 'COMPLETED')
            .reduce((sum: number, b: any) => sum + (b.total || 0), 0)
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          totalCategories: 0,
          totalServices: 0,
          pendingProviders: 0,
          todayBookings: 0,
          totalRevenue: 0
        };
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'fa-users', color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { label: 'Total Providers', value: stats?.totalProviders || 0, icon: 'fa-store', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    { label: 'Pending Verification', value: stats?.pendingProviders || 0, icon: 'fa-clock', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: 'fa-calendar-check', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'Today Bookings', value: stats?.todayBookings || 0, icon: 'fa-calendar-day', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { label: 'Total Revenue', value: `Rs ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: 'fa-coins', color: '#14b8a6', bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: 'fa-tags', color: '#f43f5e', bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
    { label: 'Services', value: stats?.totalServices || 0, icon: 'fa-concierge-bell', color: '#6366f1', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-pink-600 mb-4"></i>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to GoBeauty Admin Panel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            style={{ background: card.bg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-90 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <i className={`fa-solid ${card.icon} text-2xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/providers" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all">
            <i className="fa-solid fa-check-circle text-pink-600 text-2xl"></i>
            <div>
              <p className="font-bold">Verify Providers</p>
              <p className="text-sm text-gray-500">{stats?.pendingProviders || 0} pending</p>
            </div>
          </a>
          <a href="/categories" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <i className="fa-solid fa-tags text-blue-600 text-2xl"></i>
            <div>
              <p className="font-bold">Manage Categories</p>
              <p className="text-sm text-gray-500">{stats?.totalCategories || 0} active</p>
            </div>
          </a>
          <a href="/services" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
            <i className="fa-solid fa-concierge-bell text-green-600 text-2xl"></i>
            <div>
              <p className="font-bold">Manage Services</p>
              <p className="text-sm text-gray-500">{stats?.totalServices || 0} services</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
