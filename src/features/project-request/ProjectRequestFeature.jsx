import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectRequestButton from './ProjectRequestButton';
import ProjectRequestDrawer from './ProjectRequestDrawer';
import ProjectRequestForm from './ProjectRequestForm';
import { projectRequestConfig } from './projectRequest.config';
import './project-request.css';

export default function ProjectRequestFeature({ config = projectRequestConfig }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const drawerRef = useRef(null);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const openFromElsewhere = () => openDrawer();
    window.addEventListener('site:open-project-request', openFromElsewhere);
    return () => window.removeEventListener('site:open-project-request', openFromElsewhere);
  }, [openDrawer]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])');
      firstFocusable?.focus();
    }, 40);

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!config.enabled) return null;

  const style = {
    '--project-request-primary': config.theme?.primary || '#2F6BFF',
    '--project-request-primary-hover': config.theme?.primaryHover || '#2458D8',
    '--project-request-primary-dark': config.theme?.primaryDark || '#1748BE',
  };

  return (
    <div className="project-request-feature" style={style}>
      <ProjectRequestButton config={config} open={open} onClick={openDrawer} buttonRef={triggerRef} />
      <ProjectRequestDrawer config={config} open={open} onClose={closeDrawer} drawerRef={drawerRef}>
        <ProjectRequestForm config={config} onClose={closeDrawer} />
      </ProjectRequestDrawer>
    </div>
  );
}
