export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

export type FileKind = 'pdf' | 'image' | 'doc' | 'text';

export function fileKindOf(filename: string): FileKind {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (ext === 'docx') return 'doc';
  return 'text';
}

/** Chip label + CSS class for a file kind — shared by every table that shows files. */
export const KIND_CHIP: Record<FileKind, { label: string; cls: string }> = {
  pdf: { label: 'PDF', cls: 'kind-pdf' },
  image: { label: 'IMG', cls: 'kind-image' },
  doc: { label: 'DOC', cls: 'kind-doc' },
  text: { label: 'TXT', cls: 'kind-text' },
};
