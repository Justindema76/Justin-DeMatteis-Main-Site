const SUPABASE_URL = 'https://nowsajdmbpxvlvrhopjg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AZbVouJ6gN00dQGdZwPjog_GTQR0J-w';

export const SITE_KEY = 'justindematteis';

export async function readPublic(table, query = 'select=*') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const payload = await response.json().catch(() => []);
  if (!response.ok) throw new Error(payload?.message || 'Unable to load website content');
  return Array.isArray(payload) ? payload : [];
}
