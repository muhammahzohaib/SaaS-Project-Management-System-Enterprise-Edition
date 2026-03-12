import api from './api';

export const getOrgStats = async () => {
  const res = await api.get('/analytics/org-stats');
  return res.data;
};
