import { readPublic, SITE_KEY } from './supabase';

export const DEFAULT_STYLES = {
  primary: '#2F6BFF',
  primaryDark: '#5A8CFF',
  text: '#1D2935',
  muted: '#66788A',
  pageBackground: '#F8F7F4',
  surface: '#FFFFFF',
  lightSurface: '#E8F0FF',
  border: '#DCE4EC',
  darkSurface: '#081522',
  headingFont: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  bodyFont: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  contentWidth: 1180,
  sectionSpacing: 96,
  cardRadius: 24,
  buttonRadius: 999,
  buttonHeight: 48,
};

export const DEFAULT_HEADER = {
  brand: 'JUST INNOVATE.',
  nav1Label: 'Work', nav1Url: '/work',
  nav2Label: 'About', nav2Url: '/about',
  nav3Label: 'AI + Development', nav3Url: '/ai-development',
  nav4Label: 'Skills', nav4Url: '/experience',
  nav5Label: 'Contact', nav5Url: '/contact',
  nav6Label: '', nav6Url: '',
  nav7Label: '', nav7Url: '',
  buttonText: '', buttonUrl: '',
};

export const DEFAULT_FOOTER = {
  brand: 'JUST INNOVATE.',
  tagline: 'Justin DeMatteis • Developer • Product Builder • AI-Assisted Problem Solver',
  copyright: 'Justin DeMatteis. All rights reserved.',
};

function normalizeStyles(value = {}) {
  return {
    ...DEFAULT_STYLES,
    ...(value || {}),
    contentWidth: Number(value?.contentWidth || DEFAULT_STYLES.contentWidth),
    sectionSpacing: Number(value?.sectionSpacing || DEFAULT_STYLES.sectionSpacing),
    cardRadius: Number(value?.cardRadius || DEFAULT_STYLES.cardRadius),
    buttonRadius: Number(value?.buttonRadius || DEFAULT_STYLES.buttonRadius),
    buttonHeight: Number(value?.buttonHeight || DEFAULT_STYLES.buttonHeight),
  };
}

export function styleVars(value = {}) {
  const s = normalizeStyles(value);
  return {
    '--site-primary': s.primary,
    '--site-primary-dark': s.primaryDark,
    '--site-text': s.text,
    '--site-muted': s.muted,
    '--site-page-bg': s.pageBackground,
    '--site-surface': s.surface,
    '--site-light-surface': s.lightSurface,
    '--site-border': s.border,
    '--site-dark-surface': s.darkSurface,
    '--site-heading-font': s.headingFont,
    '--site-body-font': s.bodyFont,
    '--site-content-width': `${s.contentWidth}px`,
    '--site-section-space': `${s.sectionSpacing}px`,
    '--site-card-radius': `${s.cardRadius}px`,
    '--site-button-radius': `${s.buttonRadius}px`,
    '--site-button-height': `${s.buttonHeight}px`,
  };
}

export async function loadSetting(key, fallback) {
  try {
    const rows = await readPublic(
      'site_settings',
      `select=value&site_key=eq.${encodeURIComponent(SITE_KEY)}&key=eq.${encodeURIComponent(key)}&limit=1`
    );
    const raw = rows[0]?.value || {};
    const value = raw?.content?.[0]?.props || raw;
    return { ...fallback, ...(value || {}) };
  } catch {
    return fallback;
  }
}

export async function loadGlobalStyles() {
  const value = await loadSetting('global_styles', DEFAULT_STYLES);
  return normalizeStyles(value);
}

export async function loadPublishedPage(pageId) {
  const rows = await readPublic(
    'site_pages',
    `select=page_id,path,title,content,published_at&site_key=eq.${encodeURIComponent(SITE_KEY)}&page_id=eq.${encodeURIComponent(pageId)}&limit=1`
  );
  return rows[0] || null;
}

export async function loadBlogPosts() {
  return readPublic(
    'blog_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&order=published_at.desc`
  );
}

export async function loadBlogPost(slug) {
  const rows = await readPublic(
    'blog_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}
