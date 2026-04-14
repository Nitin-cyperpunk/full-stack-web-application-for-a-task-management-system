import { Select } from '../ui/Select';

export function TaskFilters({ filters, onChange }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
      <Select
        label="Status"
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className="min-w-[140px]"
      >
        <option value="">All</option>
        <option value="todo">To do</option>
        <option value="in_progress">In progress</option>
        <option value="done">Done</option>
      </Select>
      <Select
        label="Priority"
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
        className="min-w-[140px]"
      >
        <option value="">All</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
      <Select
        label="Sort by"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        className="min-w-[160px]"
      >
        <option value="dueDate">Due date</option>
        <option value="createdAt">Created</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
        <option value="status">Status</option>
      </Select>
      <Select
        label="Order"
        value={filters.order}
        onChange={(e) => onChange({ order: e.target.value })}
        className="min-w-[120px]"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </Select>
    </div>
  );
}
