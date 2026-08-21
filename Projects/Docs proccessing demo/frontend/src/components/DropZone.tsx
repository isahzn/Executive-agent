import { useRef, useState, type DragEvent } from 'react';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.txt';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      className={`dropzone ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Upload documents"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          e.target.value = '';
        }}
      />
      <span className="dropzone-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4" />
          <path d="M7 9l5-5 5 5" />
          <path d="M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
        </svg>
      </span>
      <p className="dropzone-title">
        <strong>Drag &amp; drop</strong> documents here, or <span className="dropzone-link">browse</span>
      </p>
      <p className="dropzone-hint">PDF · PNG · JPG · WEBP · DOCX · TXT — up to 25 MB each</p>
    </div>
  );
}
