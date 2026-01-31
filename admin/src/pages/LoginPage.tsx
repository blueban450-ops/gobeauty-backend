import React, { useState } from 'react';
import api, { apiBaseUrl } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const LoginPage: React.FC<{ onLogin: (token: string, user: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      onLogin(data.token, data.user);
    } catch (err: any) {
      if (!err.response) {
        setError(`Cannot reach API at ${apiBaseUrl}. Please start backend.`);
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
            <i className="fa-solid fa-spa text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-white">GoBeauty Admin</h1>
          <p className="text-gray-400 mt-2">Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gobeauty.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-gray-500 text-sm">Demo: admin@gobeauty.com / admin123</p>
        </form>
      </div>
    </div>
  );
};
