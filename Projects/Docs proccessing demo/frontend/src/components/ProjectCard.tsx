import type { Project } from '../api';
import ProjectIcon, { templateKind } from './ProjectIcon';
import { timeAgo } from '../lib/time';

interface Props {
  project: Project;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}

export default function ProjectCard({ project, canEdit, onOpen, onEdit, onDelete, onClone }: Props) {
  const kind = templateKind(project.templateType);
  const isTemplate = project.templateType !== null;
  const docs = project.documentCount;

  return (
    <article className="project-card" onClick={onOpen}>
      <div className="project-card-top">
        <ProjectIcon kind={kind} />
        <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
          {isTemplate && (
            <button
              type="button"
              className="icon-btn"
              title="Duplicate this project into your workspace"
              aria-label={`Duplicate ${project.name}`}
              onClick={onClone}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            </button>
          )}
          {canEdit && (
            <>
              <button type="button" className="icon-btn" title="Edit project" aria-label={`Edit ${project.name}`} onClick={onEdit}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-btn icon-btn-danger"
                title="Delete project"
                aria-label={`Delete ${project.name}`}
                onClick={onDelete}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="project-name">
        {/* No onClick here: the click bubbles to the article (and Enter/Space on
            this focused button also bubbles a click), so navigation fires once. */}
        <button type="button" className="project-name-btn" aria-label={`Open ${project.name}`}>
          {project.name}
        </button>
      </h3>
      <p className="project-desc">{project.description || 'No description yet.'}</p>

      <div className="project-chips">
        {isTemplate && <span className="chip chip-template">Template</span>}
        <span className={`chip ${project.visibility === 'public' ? 'chip-public' : 'chip-private'}`}>
          {project.visibility === 'public' ? 'Public' : 'Private'}
        </span>
        <span className="chip chip-neutral">{project.extractionFields.length} field{project.extractionFields.length === 1 ? '' : 's'}</span>
      </div>

      <div className="project-card-foot">
        <span>
          {docs} document{docs === 1 ? '' : 's'}
          {project.visibility === 'public' && project.ownerUsername ? ` · by ${project.ownerUsername}` : ''}
        </span>
        <span>Updated {timeAgo(project.updatedAt)}</span>
      </div>
    </article>
  );
}
