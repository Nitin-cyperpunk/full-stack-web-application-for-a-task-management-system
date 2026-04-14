import api from './axios';

/** Returns user rows for assignee dropdown. Non-admins get 403 from API — returns []. */
export async function listUsers() {
  try {
    const { data } = await api.get('/users');
    return Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    if (err.response?.status === 403) {
      return [];
    }
    throw err;
  }
}
