const multer = require('multer');
const path = require('path');
const { uploadDir, maxFileSize } = require('../config/env');
const { ensureDir } = require('../utils/fileUtils');

function getTmpDir() {
  return path.join(uploadDir, 'tmp');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = getTmpDir();
    ensureDir(dir)
      .then(() => cb(null, dir))
      .catch(cb);
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'file.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safe}`);
  },
});

function pdfOnly(req, file, cb) {
  const okMime = file.mimetype === 'application/pdf';
  const okExt = /\.pdf$/i.test(file.originalname || '');
  if (okMime || okExt) {
    return cb(null, true);
  }
  cb(new Error('Only PDF files are allowed'));
}

const uploadTaskPdfs = multer({
  storage,
  fileFilter: pdfOnly,
  limits: {
    files: 3,
    fileSize: maxFileSize,
  },
});

/** Multer middleware: up to 3 PDFs in field "attachments" */
const uploadAttachments = uploadTaskPdfs.array('attachments', 3);

module.exports = {
  uploadTaskPdfs,
  uploadAttachments,
};
