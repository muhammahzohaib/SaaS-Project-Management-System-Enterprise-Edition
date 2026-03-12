import api from './api';

export const getBoards = (projectId) => api.get('/boards', { params: { projectId } }).then((r) => r.data);
// Backend expects query param "projectId"
export const createBoard = (body) => api.post('/boards', body).then((r) => r.data);
export const updateBoard = (id, body) => api.put(`/boards/${id}`, body).then((r) => r.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`).then((r) => r.data);
