import api from './api';

export const getAISuggestions = (title) => api.post('/ai/suggest', { title });
export const globalSearch = (query) => api.get('/search', { params: { q: query } });
