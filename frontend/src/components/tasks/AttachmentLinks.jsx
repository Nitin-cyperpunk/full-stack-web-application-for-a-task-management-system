import { attachmentUrl } from '../../utils/assets';

export function AttachmentLinks({ paths }) {
  if (!paths || paths.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {paths.map((p, i) => {
        const name = p.split('/').pop() || `file-${i + 1}.pdf`;
        const href = attachmentUrl(p);
        return (
          <li key={`${p}-${i}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-800 underline decoration-sky-300/80 underline-offset-2 hover:text-sky-950"
            >
              {decodeURIComponent(name)}
            </a>
            <span className="ml-2 text-xs text-stone-500">open in browser</span>
          </li>
        );
      })}
    </ul>
  );
}
