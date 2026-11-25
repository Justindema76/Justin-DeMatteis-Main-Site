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
};

export const STUDIO_SETTING_KEY = 'global_shopify-studio';
