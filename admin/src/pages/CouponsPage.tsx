import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Coupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  status: 'active' | 'inactive';
}

export const CouponsPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'fixed' | 'percent'>('percent');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const queryClient = useQueryClient();

  const { data: coupons = [] } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setCode('');
      setValue('');
      setMinOrder('');
      setMaxUses('');
      setExpiresAt('');
      setIsOpen(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      minOrder: parseFloat(minOrder),
      maxUses: parseInt(maxUses),
      expiresAt,
      status: 'active'
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-500 mt-1">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-white rounded-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
        >
          + Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.expiresAt) < new Date();
          const usagePercent = (coupon.usedCount / coupon.maxUses) * 100;

          return (
            <div key={coupon._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg text-lg mb-2">
                    {coupon.code}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      coupon.status === 'active' && !isExpired 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isExpired ? 'Expired' : coupon.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="font-bold text-pink-600">
                    {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Min. Order</span>
                  <span className="font-bold">${coupon.minOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage</span>
                  <span className="font-bold">{coupon.usedCount}/{coupon.maxUses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires</span>
                  <span className="font-bold text-sm">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {usagePercent.toFixed(0)}% used
              </p>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 uppercase"
                  placeholder="WELCOME50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'fixed' | 'percent')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                >
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Value ({type === 'percent' ? '%' : '$'})
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  placeholder={type === 'percent' ? '10' : '5'}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order ($)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  placeholder="20"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Uses</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expires At</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 px-4 py-2 text-white rounded-xl font-bold"
                  style={{ background: mutation.isPending ? '#ccc' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
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
