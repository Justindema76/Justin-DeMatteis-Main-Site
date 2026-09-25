export async function submitServiceRequest(payload) {
  const response = await fetch('/api/service-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to submit your request right now.');
  }

  return data;
}
