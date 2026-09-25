export default function ProjectRequestButton({ config, open, onClick, buttonRef }) {
  if (!config.enabled) return null;

  return (
    <button
      ref={buttonRef}
      className="project-request-tab"
      type="button"
      aria-label={config.tabLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={`${config.id}-drawer`}
      onClick={onClick}
    >
      <span className="project-request-tab-dot" aria-hidden="true" />
      <span className="project-request-tab-label project-request-tab-label-desktop">{config.tabLabel}</span>
      <span className="project-request-tab-label project-request-tab-label-mobile">{config.mobileLabel || config.tabLabel}</span>
    </button>
  );
}
