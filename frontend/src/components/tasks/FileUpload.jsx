import { useRef } from 'react';

const MAX = 3;

/**
 * @param {number} existingCount attachments already on server (edit mode)
 */
export function FileUpload({ files, onChange, existingCount = 0, disabled }) {
  const inputRef = useRef(null);
  const remaining = Math.max(0, MAX - existingCount - files.length);

  function handlePick(e) {
    const picked = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name));
    const next = [...files, ...picked].slice(0, remaining);
    onChange(next);
    e.target.value = '';
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">PDF attachments</label>
      <p className="text-xs text-slate-500">
        Up to {MAX} PDFs per task total. You can add {remaining} more file(s).
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        disabled={disabled || remaining === 0}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        onChange={handlePick}
      />
      {files.length > 0 && (
        <ul className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 py-1">
              <span className="truncate text-slate-800">{f.name}</span>
              <button
                type="button"
                className="shrink-0 text-red-600 hover:underline"
                onClick={() => removeAt(i)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
