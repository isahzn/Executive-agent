/** SQLite datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC. Normalize to a Date. */
export function parseDbDate(iso: string): Date {
  const normalized = /T\d{2}:\d{2}/.test(iso) ? iso : `${iso.replace(' ', 'T')}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function timeAgo(iso: string): string {
  const then = parseDbDate(iso);
  const minutes = Math.max(0, Math.floor((Date.now() - then.getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return parseDbDate(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
