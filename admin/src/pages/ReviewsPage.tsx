import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Review {
  _id: string;
  user: { name: string; email: string };
  provider: { businessName: string };
  rating: number;
  text: string;
  createdAt: string;
}

export const ReviewsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews-all'],
    queryFn: async () => {
      // In real app, create GET /reviews endpoint for admin
      const res = await api.get('/categories'); // Placeholder
      return [];
    }
  });

  const filteredReviews = reviews.filter(r => 
    filter === 'all' || r.rating.toString() === filter
  );

  const getStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-gray-500 mt-1">Monitor and moderate customer reviews</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold ${
              filter === 'all' 
                ? 'bg-pink-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilter(star.toString() as any)}
              className={`px-4 py-2 rounded-xl font-bold ${
                filter === star.toString()
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {star} ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold">{review.user?.name}</h3>
                    <p className="text-sm text-gray-500">{review.user?.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Reviewed: <span className="font-medium">{review.provider?.businessName}</span>
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>
                  {getStars(review.rating)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{review.text}</p>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200">
                Hide Review
              </button>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200">
                Reply
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No reviews found
          </div>
        )}
      </div>
    </div>
  );
};
