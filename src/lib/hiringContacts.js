export async function submitHiringContact(payload) {
  const response = await fetch('/api/hiring-contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Unable to send your message right now.');
  return data;
}
