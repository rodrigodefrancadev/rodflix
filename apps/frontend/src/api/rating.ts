import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('rodflix_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type RatingType = 'LIKE' | 'LOVE' | 'DISLIKE';

export const ratingApi = {
  getRatings: async () => {
    const response = await axios.get<{ ratings: { catalogItemId: string; type: RatingType }[] }>(`${API_URL}/ratings`, {
      headers: getAuthHeader(),
    });
    return response.data.ratings;
  },
  
  setRating: async (catalogItemId: string, type: RatingType | null) => {
    const response = await axios.post<{ rating: RatingType | null }>(`${API_URL}/ratings`, { catalogItemId, type }, {
      headers: getAuthHeader(),
    });
    return response.data.rating;
  }
};
