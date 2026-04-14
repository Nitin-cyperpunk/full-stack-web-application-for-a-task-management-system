import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as tasksApi from '../api/tasksApi';

const TaskContext = createContext(null);

const defaultFilters = {
  status: '',
  priority: '',
  sort: 'dueDate',
  order: 'asc',
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFiltersState] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        sort: filters.sort,
        order: filters.order,
      };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const data = await tasksApi.listTasks(params);
      setTasks(data.data || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load tasks');
      setTasks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters.status, filters.priority, filters.sort, filters.order]);

  const value = useMemo(
    () => ({
      tasks,
      total,
      page,
      limit,
      filters,
      loading,
      error,
      setPage,
      setFilters,
      fetchTasks,
      getTask: tasksApi.getTask,
      createTask: tasksApi.createTask,
      updateTask: tasksApi.updateTask,
      deleteTask: tasksApi.deleteTask,
    }),
    [tasks, total, page, limit, filters, loading, error, fetchTasks]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
