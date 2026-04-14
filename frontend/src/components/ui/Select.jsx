export function Select({ label, id, error, children, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border border-stone-300/90 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-sky-600/60 focus:outline-none focus:ring-2 focus:ring-sky-500/25 ${
          error ? 'border-red-400' : ''
        }`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}
