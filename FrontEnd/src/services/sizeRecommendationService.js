import API from './api';

export const getSizeRecommendations = (userId) =>
  API.get(`/size-recommendations/user/${userId}`);

export const createSizeRecommendation = (recommendation) =>
  API.post('/size-recommendations', recommendation);

export const deleteSizeRecommendation = (id) =>
  API.delete(`/size-recommendations/${id}`);
