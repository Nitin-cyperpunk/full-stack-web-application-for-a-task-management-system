import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/datetime';

const statusLabel = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function TaskRow({ task, onDelete, deleting }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-3 py-3 font-medium text-slate-900">{task.title}</td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 md:table-cell">
        {statusLabel[task.status] || task.status}
      </td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell">
        {priorityLabel[task.priority] || task.priority}
      </td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 lg:table-cell">
        {formatDate(task.dueDate)}
      </td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 xl:table-cell">
        {task.assignedTo?.email || '—'}
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex flex-wrap justify-end gap-2">
          <Link to={`/tasks/${task._id}/edit`}>
            <Button type="button" variant="ghost" className="!py-1.5 !text-sm">
              Edit
            </Button>
          </Link>
          <Button
            type="button"
            variant="danger"
            className="!py-1.5 !text-sm"
            disabled={deleting}
            onClick={() => onDelete(task._id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
