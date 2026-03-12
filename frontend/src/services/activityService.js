import api from './api';

export const getTimeline = () => api.get('/activities/timeline');
export const getNotifications = () => api.get('/activities/notifications');
