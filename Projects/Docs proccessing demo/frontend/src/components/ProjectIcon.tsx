export type TemplateKind = 'invoice' | 'receipt' | 'contract';

export function templateKind(templateType: string | null): TemplateKind | null {
  if (templateType === 'invoice' || templateType === 'receipt' || templateType === 'contract') {
    return templateType;
  }
  return null;
}

interface Props {
  kind: TemplateKind | null;
  size?: number;
}

export default function ProjectIcon({ kind, size = 44 }: Props) {
  return (
    <span
      className={`project-icon project-icon-${kind ?? 'default'}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'invoice' && (
          <>
            <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6M9 17h6M9 9h1" />
          </>
        )}
        {kind === 'receipt' && (
          <>
            <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3z" />
            <path d="M9 9h6M9 13h6" />
          </>
        )}
        {kind === 'contract' && (
          <>
            <path d="M7 3h7l4 4v14H7z" />
            <path d="M14 3v4h4" />
            <path d="M9.5 12.5l1.5 1.5 3-3" />
            <path d="M9.5 16.5l1.5 1.5 3-3" />
          </>
        )}
        {!kind && (
          <>
            <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M13 3v5h5" />
          </>
        )}
      </svg>
    </span>
  );
}
