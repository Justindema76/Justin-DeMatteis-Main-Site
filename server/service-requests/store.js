export async function storeServiceRequest(record) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nowsajdmbpxvlvrhopjg.supabase.co';
  const publishableKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_AZbVouJ6gN00dQGdZwPjog_GTQR0J-w';

  const response = await fetch(`${supabaseUrl}/functions/v1/send-site-email`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'service_submit',
      ...record,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.ok || !payload?.request) {
    throw new Error(payload?.error || 'Unable to save service request.');
  }

  return payload.request;
}
