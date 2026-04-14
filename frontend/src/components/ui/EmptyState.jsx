export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300/90 bg-white/50 px-6 py-14 text-center backdrop-blur-[2px]">
      <p className="font-display text-lg font-semibold text-stone-800">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-stone-600">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
