import type { ReactNode } from 'react';
import { useCloseOnEscape } from '../lib/useCloseOnEscape';

interface Props {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  // Don't let Escape dismiss the dialog mid-request (e.g. while a delete is in flight).
  useCloseOnEscape(busy ? () => undefined : onCancel);
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <h3>{title}</h3>
          <div className="confirm-message">{message}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
              {busy ? <span className="spinner spinner-sm" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
