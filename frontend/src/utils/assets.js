/** Backend serves uploads at GET /uploads/... */
export function serverBase() {
  return (import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '');
}

/** @param {string} storedPath path relative to upload dir, e.g. tasks/<id>/file.pdf */
export function attachmentUrl(storedPath) {
  if (!storedPath) return '#';
  const base = serverBase();
  const p = String(storedPath).replace(/^[/\\]+/, '');
  return `${base}/uploads/${p}`;
}
