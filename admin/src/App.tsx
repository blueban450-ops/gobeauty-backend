import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ServicesPage } from './pages/ServicesPage';
import { UsersPage } from './pages/UsersPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { BookingsPage } from './pages/BookingsPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { FinancePage } from './pages/FinancePage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

const queryClient = new QueryClient();

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', path: '/' },
    { id: 'categories', label: 'Categories', icon: 'fa-tags', path: '/categories' },
    { id: 'services', label: 'Services', icon: 'fa-concierge-bell', path: '/services' },
    { id: 'users', label: 'Users', icon: 'fa-users', path: '/users' },
    { id: 'providers', label: 'Providers', icon: 'fa-store', path: '/providers' },
    { id: 'bookings', label: 'Bookings', icon: 'fa-calendar-check', path: '/bookings' },
    { id: 'settings', label: 'Settings', icon: 'fa-gear', path: '/settings' }
  ];

  return (
    <div className="w-64 h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-spa"></i> GoBeauty
        </h1>
      </div>

      <nav className="mt-8 space-y-2 px-4 border-l border-pink-400" style={{ borderLeftWidth: '2px' }}>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 w-64 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-all"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (token: string, userData: User) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar onLogout={handleLogout} />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
