import api from './axios';

/**
 * @param {Record<string, string|number|undefined>} params
 */
export async function listTasks(params) {
  const { data } = await api.get('/tasks', { params });
  return data;
}

export async function getTask(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

/**
 * @param {object|FormData} payload
 */
export async function createTask(payload) {
  const { data } = await api.post('/tasks', payload);
  return data;
}

/**
 * @param {string} id
 * @param {object|FormData} payload
 */
export async function updateTask(id, payload) {
  const { data } = await api.patch(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}
