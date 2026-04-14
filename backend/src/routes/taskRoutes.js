const express = require('express');
const { body, query, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { optionalMultipart } = require('../middleware/optionalMultipart');
const { validateRequest } = require('../middleware/validateRequest');
const taskController = require('../controllers/taskController');

const router = express.Router();

const listQuery = [
  query('status').optional().isIn(['todo', 'in_progress', 'done']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('assignedTo').optional().isMongoId(),
  query('sort').optional().isIn(['dueDate', 'createdAt', 'priority', 'title', 'status']),
  query('order').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const createBody = [
  body('title').trim().notEmpty(),
  body('description').optional({ checkFalsy: false }).isString(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate')
    .optional({ values: 'falsy' })
    .custom((v) => v === null || v === undefined || v === '' || !Number.isNaN(Date.parse(String(v)))),
  body('assignedTo')
    .optional({ values: 'falsy' })
    .custom((v) => v === null || v === undefined || v === '' || /^[a-fA-F0-9]{24}$/.test(String(v))),
];

const updateBody = [
  body('title').optional().trim().notEmpty(),
  body('description').optional({ checkFalsy: false }).isString(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate')
    .optional({ values: 'falsy' })
    .custom((v) => v === null || v === undefined || v === '' || !Number.isNaN(Date.parse(String(v)))),
  body('assignedTo')
    .optional({ values: 'falsy' })
    .custom((v) => v === null || v === undefined || v === '' || /^[a-fA-F0-9]{24}$/.test(String(v))),
];

router.use(authenticate);

router.get('/', listQuery, asyncHandler(taskController.listTasks));
router.get('/:id', param('id').isMongoId(), validateRequest, asyncHandler(taskController.getTask));

router.post('/', optionalMultipart, createBody, validateRequest, asyncHandler(taskController.createTask));
router.put(
  '/:id',
  optionalMultipart,
  param('id').isMongoId(),
  updateBody,
  validateRequest,
  asyncHandler(taskController.updateTask)
);
router.patch(
  '/:id',
  optionalMultipart,
  param('id').isMongoId(),
  updateBody,
  validateRequest,
  asyncHandler(taskController.updateTask)
);

router.delete('/:id', param('id').isMongoId(), validateRequest, asyncHandler(taskController.deleteTask));

module.exports = router;
