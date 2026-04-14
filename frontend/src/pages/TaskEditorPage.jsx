import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import * as usersApi from '../api/usersApi';
import { AttachmentLinks } from '../components/tasks/AttachmentLinks';
import { FileUpload } from '../components/tasks/FileUpload';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../utils/datetime';

export function TaskEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTask, createTask, updateTask, fetchTasks } = useTasks();

  const [loadingTask, setLoadingTask] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [assignees, setAssignees] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueLocal, setDueLocal] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [readOnlyAssigneeEmail, setReadOnlyAssigneeEmail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (user?.role === 'admin') {
      usersApi
        .listUsers()
        .then((list) => {
          if (!cancelled) setAssignees(list);
        })
        .catch(() => {
          if (!cancelled) setAssignees([]);
        });
    } else {
      setAssignees([]);
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoadingTask(true);
    setError(null);
    getTask(id)
      .then((task) => {
        if (cancelled) return;
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'todo');
        setPriority(task.priority || 'medium');
        setDueLocal(toDatetimeLocalValue(task.dueDate));
        setExistingAttachments(Array.isArray(task.attachments) ? task.attachments : []);
        if (task.assignedTo) {
          const aid = typeof task.assignedTo === 'object' && task.assignedTo._id
            ? task.assignedTo._id
            : task.assignedTo;
          setAssignedToId(aid ? String(aid) : '');
          if (user?.role !== 'admin' && task.assignedTo.email) {
            setReadOnlyAssigneeEmail(task.assignedTo.email);
          }
        } else {
          setAssignedToId('');
          setReadOnlyAssigneeEmail(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || e.message || 'Failed to load task');
      })
      .finally(() => {
        if (!cancelled) setLoadingTask(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, getTask, user]);

  function buildJsonBody() {
    const body = {
      title: title.trim(),
      description: description || '',
      status,
      priority,
      dueDate: fromDatetimeLocalValue(dueLocal) || null,
    };
    if (user?.role === 'admin') {
      body.assignedTo = assignedToId || null;
    }
    return body;
  }

  function appendCommonFields(fd) {
    fd.append('title', title.trim());
    fd.append('description', description || '');
    fd.append('status', status);
    fd.append('priority', priority);
    const due = fromDatetimeLocalValue(dueLocal);
    fd.append('dueDate', due || '');
    if (user?.role === 'admin') {
      fd.append('assignedTo', assignedToId || '');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const existingCount = existingAttachments.length;
    const totalAfter = existingCount + newFiles.length;
    if (totalAfter > 3) {
      setError('A task can have at most 3 PDF attachments.');
      setSaving(false);
      return;
    }

    try {
      if (!isEdit) {
        if (newFiles.length > 0) {
          const fd = new FormData();
          appendCommonFields(fd);
          newFiles.forEach((f) => fd.append('attachments', f));
          await createTask(fd);
        } else {
          await createTask(buildJsonBody());
        }
      } else {
        if (newFiles.length > 0) {
          const fd = new FormData();
          appendCommonFields(fd);
          newFiles.forEach((f) => fd.append('attachments', f));
          await updateTask(id, fd);
        } else {
          await updateTask(id, buildJsonBody());
        }
      }
      await fetchTasks();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      const details = err.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => d.msg || d.message).join(', ') || msg);
      } else {
        setError(msg || err.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadingTask) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{isEdit ? 'Edit task' : 'New task'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <Alert>{error}</Alert>}

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </Select>
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <Input
          label="Due date"
          type="datetime-local"
          value={dueLocal}
          onChange={(e) => setDueLocal(e.target.value)}
        />

        {user?.role === 'admin' && assignees.length > 0 && (
          <Select
            label="Assign to"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </Select>
        )}

        {user?.role !== 'admin' && isEdit && readOnlyAssigneeEmail && (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">Assigned to: </span>
            {readOnlyAssigneeEmail}
            <span className="mt-1 block text-xs text-slate-500">
              Only admins can change assignee (user list requires admin access).
            </span>
          </p>
        )}

        {isEdit && existingAttachments.length > 0 && (
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Attachments</span>
            <AttachmentLinks paths={existingAttachments} />
          </div>
        )}

        <FileUpload
          files={newFiles}
          onChange={setNewFiles}
          existingCount={existingAttachments.length}
          disabled={saving}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner className="h-4 w-4" /> Saving…
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Link to="/">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
