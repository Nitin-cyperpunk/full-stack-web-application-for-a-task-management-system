export function Alert({ variant = 'error', children, className = '' }) {
  const styles =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : 'bg-red-50 text-red-900 border-red-200';
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${styles} ${className}`}
    >
      {children}
    </div>
  );
}
