import { X } from 'lucide-react';

export default function ProjectRequestDrawer({ config, open, onClose, drawerRef, children }) {
  return (
    <>
      <div
        className={`project-request-overlay${open ? ' is-open' : ''}`}
        aria-hidden="true"
        onMouseDown={onClose}
      />
      <aside
        id={`${config.id}-drawer`}
        ref={drawerRef}
        className={`project-request-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby={`${config.id}-title`}
        inert={open ? undefined : 'true'}
      >
        <div className="project-request-drawer-head">
          <div>
            <span className="project-request-eyebrow">{config.eyebrow}</span>
            <h2 id={`${config.id}-title`}>{config.title}</h2>
            <p>{config.description}</p>
          </div>
          <button className="project-request-close" type="button" onClick={onClose} aria-label="Close project request form">
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
