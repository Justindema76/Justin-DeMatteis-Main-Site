function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function storeServiceRequest(record) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nowsajdmbpxvlvrhopjg.supabase.co';
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(`${supabaseUrl}/rest/v1/service_requests`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(record),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || payload?.hint || 'Unable to store service request';
    throw new Error(message);
  }

  return Array.isArray(payload) ? payload[0] : payload;
}
