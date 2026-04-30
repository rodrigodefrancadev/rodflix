import apiClient from './apiClient';

export type RatingType = 'LIKE' | 'LOVE' | 'DISLIKE';

export const ratingApi = {
  getRatings: async () => {
    const response = await apiClient.get<{ ratings: { catalogItemId: string; type: RatingType }[] }>('/ratings');
    return response.data.ratings;
  },
  
  setRating: async (catalogItemId: string, type: RatingType | null) => {
    const response = await apiClient.post<{ rating: RatingType | null }>('/ratings', { catalogItemId, type });
    return response.data.rating;
  }
};
