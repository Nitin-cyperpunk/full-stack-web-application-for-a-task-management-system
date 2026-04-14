const fs = require('fs/promises');
const path = require('path');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Remove files listed by relative paths from project upload root (e.g. uploads/foo.pdf).
 */
async function unlinkUploadedFiles(uploadRoot, relativePaths) {
  if (!Array.isArray(relativePaths) || relativePaths.length === 0) return;
  for (const rel of relativePaths) {
    if (!rel || typeof rel !== 'string') continue;
    const normalized = rel.replace(/^[/\\]+/, '');
    const full = path.join(uploadRoot, normalized);
    if (!full.startsWith(uploadRoot)) continue;
    try {
      await fs.unlink(full);
    } catch {
      // ignore missing files
    }
  }
}

/**
 * Move files from temp dir into task-specific folder; returns new relative paths.
 */
async function moveFilesToTaskDir(uploadRoot, taskId, files) {
  if (!files || files.length === 0) return [];
  const destDir = path.join(uploadRoot, 'tasks', String(taskId));
  await ensureDir(destDir);
  const out = [];
  for (const file of files) {
    const destName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFilename(file.originalname)}`;
    const dest = path.join(destDir, destName);
    await fs.rename(file.path, dest);
    const rel = path.relative(uploadRoot, dest).split(path.sep).join('/');
    out.push(rel);
  }
  return out;
}

function sanitizeFilename(name) {
  return String(name || 'file.pdf').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'file.pdf';
}

module.exports = {
  ensureDir,
  unlinkUploadedFiles,
  moveFilesToTaskDir,
  sanitizeFilename,
};
