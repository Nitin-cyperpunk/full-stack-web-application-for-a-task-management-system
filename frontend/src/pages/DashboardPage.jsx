import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskList } from '../components/tasks/TaskList';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';

export function DashboardPage() {
  const {
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
    deleteTask,
  } = useTasks();
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this task?')) return;
      setDeleteError(null);
      setDeletingId(id);
      try {
        await deleteTask(id);
        await fetchTasks();
      } catch (e) {
        setDeleteError(e.response?.data?.message || e.message || 'Delete failed');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteTask, fetchTasks]
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 border-b border-stone-200/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900">Your tasks</h1>
          <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-stone-600">
            Narrow things down with filters — nothing fancy, just what you need today.
          </p>
        </div>
        <Link to="/tasks/new" className="shrink-0">
          <Button className="w-full sm:w-auto">Add a task</Button>
        </Link>
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {error && (
        <Alert className="mb-4">
          {error}
          <Button type="button" variant="ghost" className="ml-2 !p-0 !text-sm" onClick={() => fetchTasks()}>
            Retry
          </Button>
        </Alert>
      )}
      {deleteError && <Alert className="mb-4">{deleteError}</Alert>}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-9 w-9 text-stone-700" />
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          description="Start with one small task — you can always edit it later."
          action={
            <Link to="/tasks/new">
              <Button>Write a task</Button>
            </Link>
          }
        />
      )}

      {!loading && tasks.length > 0 && (
        <>
          <TaskList tasks={tasks} onDelete={handleDelete} deletingId={deletingId} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/60 pt-6 text-sm text-stone-600">
            <span>
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
