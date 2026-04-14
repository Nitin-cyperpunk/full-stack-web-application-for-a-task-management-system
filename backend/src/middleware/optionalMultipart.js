const { uploadAttachments } = require('./uploadTaskPdfs');

/**
 * Runs multer only when Content-Type is multipart/form-data (so JSON-only requests skip file handling).
 */
function optionalMultipart(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return uploadAttachments(req, res, next);
  }
  return next();
}

module.exports = { optionalMultipart };
