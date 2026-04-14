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

  const isAdmin = user?.role === 'admin';
  const canPickAssignee = isAdmin && assignees.length > 0;

  useEffect(() => {
    let cancelled = false;
    if (isAdmin) {
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
  }, [isAdmin]);

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
          const aid =
            typeof task.assignedTo === 'object' && task.assignedTo._id
              ? task.assignedTo._id
              : task.assignedTo;
          setAssignedToId(aid ? String(aid) : '');
          if (!isAdmin && task.assignedTo.email) {
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
  }, [id, isEdit, getTask, isAdmin]);

  function buildJsonBody() {
    const body = {
      title: title.trim(),
      description: description || '',
      status,
      priority,
      dueDate: fromDatetimeLocalValue(dueLocal) || null,
    };
    if (isAdmin) {
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
    if (isAdmin) {
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
        <Spinner className="h-9 w-9 text-stone-700" />
      </div>
    );
  }

  const textareaClass =
    'w-full rounded-lg border border-stone-300/90 px-3 py-2.5 text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-sky-600/60 focus:outline-none focus:ring-2 focus:ring-sky-500/25';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-block text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
        >
          ← Back to list
        </Link>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-stone-900">
          {isEdit ? 'Edit task' : 'New task'}
        </h1>
        <p className="mt-1.5 text-[15px] text-stone-600">
          {isEdit ? 'Tweak details below — saves are immediate when you hit save.' : 'Add the basics; you can refine later.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-stone-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      >
        {error && <Alert>{error}</Alert>}

        <div className="space-y-5">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">Description</span>
            <textarea
              className={textareaClass}
              rows={4}
              placeholder="Context, links, whatever helps the next person…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
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
        </div>

        {/* Assignment — always visible so people know the option exists */}
        <section className="rounded-xl border border-amber-200/50 bg-gradient-to-b from-amber-50/40 to-stone-50/30 p-5">
          <h2 className="font-display text-lg font-semibold text-stone-900">Assignment</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-stone-600">
            Who should own this? Optional — leave unassigned if it is still up in the air.
          </p>

          <div className="mt-4">
            {canPickAssignee && (
              <Select
                label="Assign to"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              >
                <option value="">Nobody yet</option>
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </Select>
            )}

            {isAdmin && assignees.length === 0 && (
              <p className="rounded-lg border border-dashed border-stone-300/80 bg-white/60 px-3 py-2.5 text-sm text-stone-600">
                Could not load the team list (check your connection or permissions). You can still save the task —
                assignment stays empty until that works.
              </p>
            )}

            {!isAdmin && (
              <div className="rounded-lg border border-stone-200/90 bg-white/70 px-3 py-3 text-sm leading-relaxed text-stone-700">
                <p>
                  Picking someone from a list needs admin access on this app. Your task saves as usual; if you need it
                  assigned, ask an admin to set the owner.
                </p>
                {isEdit && readOnlyAssigneeEmail && (
                  <p className="mt-3 border-t border-stone-200/80 pt-3 text-stone-800">
                    <span className="text-stone-500">Currently: </span>
                    <span className="font-medium">{readOnlyAssigneeEmail}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {isEdit && existingAttachments.length > 0 && (
          <div>
            <span className="mb-2 block text-sm font-medium text-stone-700">Attachments</span>
            <AttachmentLinks paths={existingAttachments} />
          </div>
        )}

        <FileUpload
          files={newFiles}
          onChange={setNewFiles}
          existingCount={existingAttachments.length}
          disabled={saving}
        />

        <div className="flex flex-wrap gap-3 border-t border-stone-200/60 pt-6">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner className="h-4 w-4" /> Saving…
              </>
            ) : (
              'Save task'
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
