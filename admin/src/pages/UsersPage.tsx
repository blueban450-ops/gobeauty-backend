import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PROVIDER';
  status: 'active' | 'blocked' | 'pending';
  phone?: string;
  createdAt: string;
  businessName?: string;
  category?: string;
  city?: string;
}

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data;
    }
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => api.patch(`/auth/users/${userId}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      PROVIDER: 'bg-blue-100 text-blue-700',
      CUSTOMER: 'bg-gray-100 text-gray-700'
    };
    return colors[role] || colors.CUSTOMER;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      blocked: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers</option>
            <option value="professional">Professionals</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-bold">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.phone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-3 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    View Details
                  </button>
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => blockMutation.mutate(user._id)}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        user.status === 'blocked' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600">Full Name</label>
                    <p className="text-gray-900">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedUser.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Role</label>
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(selectedUser.role)}`}>
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Status</label>
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedUser.status)}`}>
                      {selectedUser.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Joined</label>
                    <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              {selectedUser.role === 'PROVIDER' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-600">Business Name</label>
                      <p className="text-gray-900">{selectedUser.businessName || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-600">Category</label>
                      <p className="text-gray-900">{selectedUser.category || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-600">City</label>
                      <p className="text-gray-900">{selectedUser.city || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedUser.status === 'pending' && (
                  <button
                    onClick={() => {
                      // Approve logic
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl"
                  >
                    Approve
                  </button>
                )}
                {selectedUser.status !== 'blocked' && selectedUser.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      blockMutation.mutate(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl"
                  >
                    Block User
                  </button>
                )}
                {selectedUser.status === 'blocked' && selectedUser.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      blockMutation.mutate(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-xl"
                  >
                    Unblock User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
