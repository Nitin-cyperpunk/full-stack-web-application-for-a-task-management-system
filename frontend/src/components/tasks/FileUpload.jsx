const MAX = 3;

/**
 * @param {number} existingCount attachments already on server (edit mode)
 */
export function FileUpload({ files, onChange, existingCount = 0, disabled }) {
  const remaining = Math.max(0, MAX - existingCount - files.length);

  function handlePick(e) {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
    );
    const next = [...files, ...picked].slice(0, remaining);
    onChange(next);
    e.target.value = '';
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-stone-700">PDFs</span>
      <p className="text-xs leading-relaxed text-stone-500">
        Max {MAX} files total on a task. {remaining > 0 ? `You can add ${remaining} more.` : 'Limit reached.'}
      </p>
      <input
        type="file"
        accept="application/pdf,.pdf"
        multiple
        disabled={disabled || remaining === 0}
        className="block w-full cursor-pointer text-sm text-stone-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-800 hover:file:bg-stone-200/90"
        onChange={handlePick}
      />
      {files.length > 0 && (
        <ul className="rounded-lg border border-stone-200/90 bg-stone-50/80 p-2 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 py-1.5">
              <span className="truncate text-stone-800">{f.name}</span>
              <button
                type="button"
                className="shrink-0 text-xs font-medium text-red-700 hover:underline"
                onClick={() => removeAt(i)}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
