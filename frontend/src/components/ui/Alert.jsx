export function Alert({ variant = 'error', children, className = '' }) {
  const styles =
    variant === 'success'
      ? 'border-emerald-200/90 bg-emerald-50/95 text-emerald-950'
      : 'border-red-200/90 bg-red-50/95 text-red-950';
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm leading-snug ${styles} ${className}`}
    >
      {children}
    </div>
  );
}
