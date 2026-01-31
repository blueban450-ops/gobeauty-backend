import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Category {
  _id: string;
  name: string;
  icon: string;
  status: 'active' | 'inactive';
}

export const CategoriesPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('spa');
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: { name: string; icon: string; status: string }) => 
      api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setIcon('spa');
      setIsOpen(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, icon, status: 'active' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-white rounded-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <i className={`fa-solid fa-${cat.icon} text-pink-600 text-lg`}></i>
              </div>
              <h3 className="font-bold text-lg">{cat.name}</h3>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {cat.status}
            </span>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Spa & Massage"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:border-pink-500"
                >
                  <option value="spa">Spa</option>
                  <option value="hand-sparkles">Nails</option>
                  <option value="scissors">Hair</option>
                  <option value="wand-magic-sparkles">Makeup</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 bg-gray-100 rounded-xl font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-2 text-white rounded-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
                >
                  {mutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
