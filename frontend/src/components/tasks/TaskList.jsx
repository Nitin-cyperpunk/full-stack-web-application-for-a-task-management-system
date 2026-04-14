import { TaskRow } from './TaskRow';

export function TaskList({ tasks, onDelete, deletingId }) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3">Title</th>
              <th className="hidden px-3 py-3 md:table-cell">Status</th>
              <th className="hidden px-3 py-3 sm:table-cell">Priority</th>
              <th className="hidden px-3 py-3 lg:table-cell">Due</th>
              <th className="hidden px-3 py-3 xl:table-cell">Assigned</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onDelete={onDelete}
                deleting={deletingId === task._id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
