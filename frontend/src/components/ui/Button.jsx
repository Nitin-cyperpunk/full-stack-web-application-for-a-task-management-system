export function Button({ children, className = '', variant = 'primary', disabled, type = 'button', ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 disabled:opacity-50';
  const variants = {
    primary:
      'bg-stone-800 text-white shadow-sm hover:bg-stone-700 focus:ring-stone-500 active:bg-stone-800/95',
    secondary:
      'border border-stone-300/90 bg-white text-stone-800 shadow-sm hover:border-stone-400 hover:bg-stone-50 focus:ring-stone-400',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500',
    ghost: 'text-stone-700 hover:bg-stone-100/90 focus:ring-stone-400',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
