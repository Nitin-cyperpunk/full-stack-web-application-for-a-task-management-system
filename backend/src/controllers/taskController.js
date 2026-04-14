const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { uploadDir } = require('../config/env');
const { unlinkUploadedFiles, moveFilesToTaskDir } = require('../utils/fileUtils');

const SORT_FIELDS = new Set(['dueDate', 'createdAt', 'priority', 'title', 'status']);

function parseOptionalObjectId(value) {
  if (value === undefined || value === null || value === '') return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return undefined;
  return new mongoose.Types.ObjectId(value);
}

function parseTaskPayload(body, { partial = false } = {}) {
  const out = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, 'title')) {
    out.title = body.title;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'description')) {
    out.description = body.description !== undefined ? body.description : partial ? undefined : '';
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'status')) {
    out.status = body.status !== undefined ? body.status : partial ? undefined : 'todo';
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'priority')) {
    out.priority = body.priority !== undefined ? body.priority : partial ? undefined : 'medium';
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'dueDate')) {
    if (body.dueDate === '' || body.dueDate === null || body.dueDate === undefined) {
      out.dueDate = partial ? undefined : null;
    } else if (body.dueDate !== undefined) {
      const d = new Date(body.dueDate);
      if (Number.isNaN(d.getTime())) {
        return { error: 'Invalid dueDate' };
      }
      out.dueDate = d;
    }
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'assignedTo')) {
    if (body.assignedTo === '' || body.assignedTo === null || body.assignedTo === undefined) {
      out.assignedTo = partial ? undefined : null;
    } else {
      const id = parseOptionalObjectId(body.assignedTo);
      if (id === undefined) {
        return { error: 'Invalid assignedTo' };
      }
      out.assignedTo = id;
    }
  }

  return { value: out };
}

async function listTasks(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', details: errors.array() });
  }

  const {
    status,
    priority,
    assignedTo,
    sort = 'createdAt',
    order = 'desc',
    page = '1',
    limit = '10',
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) {
    const id = parseOptionalObjectId(assignedTo);
    if (id === undefined) {
      return res.status(400).json({ message: 'Invalid assignedTo filter' });
    }
    filter.assignedTo = id;
  }

  const sortField = SORT_FIELDS.has(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email')
      .lean(),
    Task.countDocuments(filter),
  ]);

  res.json({
    data,
    total,
    page: pageNum,
    limit: limitNum,
  });
}

async function getTask(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  const task = await Task.findById(id).populate('assignedTo', 'email').populate('createdBy', 'email');
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(task);
}

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', details: errors.array() });
  }

  const parsed = parseTaskPayload(req.body, { partial: false });
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  if (parsed.value.assignedTo) {
    const exists = await User.exists({ _id: parsed.value.assignedTo });
    if (!exists) {
      return res.status(400).json({ message: 'assignedTo user not found' });
    }
  }

  const files = req.files || [];
  if (files.length > 3) {
    return res.status(400).json({ message: 'Maximum 3 PDF files allowed per request' });
  }

  const task = await Task.create({
    ...parsed.value,
    attachments: [],
    createdBy: req.user.id,
  });

  let attachmentPaths = [];
  if (files.length > 0) {
    attachmentPaths = await moveFilesToTaskDir(uploadDir, task._id, files);
    task.attachments = attachmentPaths;
    await task.save();
  }

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'email')
    .populate('createdBy', 'email');
  res.status(201).json(populated);
}

async function updateTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', details: errors.array() });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Treat PUT and PATCH as partial updates (fields omitted are left unchanged).
  const parsed = parseTaskPayload(req.body, { partial: true });
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const updates = parsed.value;
  if (updates.assignedTo !== undefined && updates.assignedTo !== null) {
    const exists = await User.exists({ _id: updates.assignedTo });
    if (!exists) {
      return res.status(400).json({ message: 'assignedTo user not found' });
    }
  }

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      task[key] = updates[key];
    }
  });

  const files = req.files || [];
  const currentCount = task.attachments.length;
  if (currentCount + files.length > 3) {
    return res.status(400).json({
      message: `Cannot add ${files.length} file(s); task already has ${currentCount} attachment(s) (max 3 total)`,
    });
  }

  if (files.length > 0) {
    const newPaths = await moveFilesToTaskDir(uploadDir, task._id, files);
    task.attachments = [...task.attachments, ...newPaths];
  }

  await task.save();

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'email')
    .populate('createdBy', 'email');
  res.json(populated);
}

async function deleteTask(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await unlinkUploadedFiles(uploadDir, task.attachments);
  await task.deleteOne();
  res.status(204).send();
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
