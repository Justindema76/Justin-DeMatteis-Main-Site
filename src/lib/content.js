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
  h1Size: 64,
  h2Size: 48,
  h3Size: 36,
  h4Size: 24,
  contentWidth: 1180,
  sectionSpacing: 96,
  cardRadius: 24,
  buttonRadius: 999,
  buttonHeight: 48,
};

export const DEFAULT_HEADER = {
  brand: 'Justin DeMatteis',
  brandFirst: 'Justin',
  brandSecond: 'DeMatteis',
  brandFirstColor: '#0B1F33',
  brandSecondColor: '#2F6BFF',
  nav1Label: 'Home', nav1Url: '/',
  nav2Label: 'Skills', nav2Url: '/skills',
  nav3Label: 'Work Experience', nav3Url: '/work',
  nav4Label: 'AI + Development', nav4Url: '/ai-development',
  nav5Label: 'Contact', nav5Url: '/contact',
  nav6Label: '', nav6Url: '',
  nav7Label: '', nav7Url: '',
  buttonText: '', buttonUrl: '',
  socialIconColor: '#415162',
  socialIconBackground: 'var(--site-surface,#fff)',
  socialIconBorder: 'var(--site-border,#DCE4EC)',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: 'var(--site-primary,#2F6BFF)',
};

export const DEFAULT_FOOTER = {
  brand: 'JUST INNOVATE.',
  tagline: 'Justin DeMatteis • Developer • Product Builder • AI-Assisted Problem Solver',
  copyright: 'Justin DeMatteis. All rights reserved.',
  socialIconColor: '#ffffff',
  socialIconBackground: 'rgba(255,255,255,.04)',
  socialIconBorder: 'rgba(255,255,255,.18)',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: 'var(--site-primary,#2F6BFF)',
};

function normalizeStyles(value = {}) {
  return {
    ...DEFAULT_STYLES,
    ...(value || {}),
    h1Size: Number(value?.h1Size || DEFAULT_STYLES.h1Size),
    h2Size: Number(value?.h2Size || DEFAULT_STYLES.h2Size),
    h3Size: Number(value?.h3Size || DEFAULT_STYLES.h3Size),
    h4Size: Number(value?.h4Size || DEFAULT_STYLES.h4Size),
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
    '--site-h1-size': `${s.h1Size}px`,
    '--site-h2-size': `${s.h2Size}px`,
    '--site-h3-size': `${s.h3Size}px`,
    '--site-h4-size': `${s.h4Size}px`,
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

export async function loadWorkPost(slug) {
  const rows = await readPublic(
    'work_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}

export async function loadAiPost(slug) {
  const rows = await readPublic(
    'ai_posts',
    `select=*&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}

export async function loadAiPosts() {
  return readPublic(
    'ai_posts',
    `select=id,slug,title,work_type,company,role,platform,audience,excerpt,featured_image,featured_image_alt,project_url,tags,seo_title,seo_description,status,published_at,updated_at&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&order=published_at.desc`
  );
}

export async function loadWorkPosts() {
  return readPublic(
    'work_posts',
    `select=id,slug,title,work_type,company,role,platform,audience,excerpt,featured_image,featured_image_alt,project_url,tags,seo_title,seo_description,status,published_at,updated_at&site_key=eq.${encodeURIComponent(SITE_KEY)}&status=eq.published&order=published_at.desc`
  );
}
