import api from './api';

export const getTasks = (boardId) => api.get('/tasks', { params: { boardId } }).then((r) => r.data);
export const createTask = (body) => api.post('/tasks', body).then((r) => r.data);
export const updateTask = (id, body) => api.put(`/tasks/${id}`, body).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((r) => r.data);
export const addComment = (id, text) => api.post(`/tasks/${id}/comments`, { text }).then((r) => r.data);
export const addSubtask = (id, title) => api.post(`/tasks/${id}/subtasks`, { title }).then((r) => r.data);
