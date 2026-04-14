const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      default: '',
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator(arr) {
          return arr.length <= 3;
        },
        message: 'A maximum of 3 attachments is allowed per task',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, priority: 1, dueDate: 1, assignedTo: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
