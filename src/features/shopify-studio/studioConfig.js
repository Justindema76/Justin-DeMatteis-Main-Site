// Shopify Studio: the era-themed landing page and the Jill & The Beanstalk case study.
// Every era says the same thing; only the styling changes. The page markup and styles
// live in ./content and ./styles (generated from the approved previews).
// Settings are edited in the admin (Website → Shopify Studio) and saved as the
// site_settings key "global_shopify-studio".

export const STUDIO_ERAS = [
  { key: '50s', label: '1950s' },
  { key: '60s', label: '1960s' },
  { key: '70s', label: '1970s' },
  { key: '80s', label: '1980s Neon' },
  { key: '80s-memphis', label: '1980s Memphis' },
  { key: '90s', label: '1990s' },
  { key: '2000s', label: '2000s / Y2K' },
  { key: '2010s', label: '2010s' },
];

export const STUDIO_DEFAULTS = {
  defaultEra: '50s',
  enabledEras: STUDIO_ERAS.map(era => era.key),
  showEraSwitcher: true,
  switcherLabel: 'Try another decade',
  spotsLeft: '',
  priceTuneUp: '',
  priceRedesign: '',
  priceCustomApp: '',
  // Hero pictures per era. Blank = use the built-in picture below. Edited in the admin.
  heroImages: {},
};

// Built-in hero pictures. desktop = wide picture behind the hero on big screens,
// phone = 3x4 picture shown under the hero text on phones (blank = no picture on phones).
export const HERO_DEFAULTS = {
  '50s': { desktop: '/shopify-studio/img/bag-50s.webp', phone: '/shopify-studio/img/hero-phone-50s.webp' },
  '60s': { desktop: '/shopify-studio/img/bag-60s-v1.webp', phone: '/shopify-studio/img/hero-phone-60s.webp' },
  '70s': { desktop: '/shopify-studio/img/bag-70s-v1.webp', phone: '/shopify-studio/img/hero-phone-70s.webp' },
  '80s': { desktop: '/shopify-studio/img/bag-80s-v1.webp', phone: '/shopify-studio/img/hero-phone-80s.webp' },
  '80s-memphis': { desktop: '/shopify-studio/img/bag-80s-memphis-v1.webp', phone: '/shopify-studio/img/hero-phone-80s-memphis.webp' },
  '90s': { desktop: '/shopify-studio/img/bag-90s-v1.webp', phone: '/shopify-studio/img/hero-phone-90s.webp' },
  '2000s': { desktop: '/shopify-studio/img/bag-2000s-v1.webp', phone: '/shopify-studio/img/hero-phone-2000s.webp' },
  '2010s': { desktop: '/shopify-studio/img/bag-2010s-v1.webp', phone: '' },
};

export const STUDIO_SETTING_KEY = 'global_shopify-studio';
