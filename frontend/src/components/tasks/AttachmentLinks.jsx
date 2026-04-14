import { attachmentUrl } from '../../utils/assets';

export function AttachmentLinks({ paths }) {
  if (!paths || paths.length === 0) return null;

  return (
    <ul className="space-y-2">
      {paths.map((p, i) => {
        const name = p.split('/').pop() || `file-${i + 1}.pdf`;
        const href = attachmentUrl(p);
        return (
          <li key={`${p}-${i}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              {decodeURIComponent(name)}
            </a>
            <span className="ml-2 text-xs text-slate-500">(open / download)</span>
          </li>
        );
      })}
    </ul>
  );
}
