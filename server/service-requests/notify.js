import tls from 'node:tls';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nowsajdmbpxvlvrhopjg.supabase.co';

function serverSecret() {
  const value = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('Missing required Supabase server secret.');
  return value;
}

function clean(value, max = 4000) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[ch] || ch));
}

function normalizeList(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(source.map(item => clean(item, 320).toLowerCase()).filter(Boolean))];
}

class SmtpReader {
  constructor(socket) {
    this.buffer = '';
    this.current = [];
    this.queue = [];
    this.waiters = [];
    this.failure = null;

    socket.setEncoding('utf8');
    socket.on('data', chunk => {
      this.buffer += chunk;
      this.drain();
    });
    socket.on('error', error => this.fail(error));
    socket.on('close', hadError => {
      if (!hadError && !this.failure) this.fail(new Error('SMTP connection closed unexpectedly.'));
    });
  }

  drain() {
    const lines = this.buffer.split('\r\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line) continue;
      this.current.push(line);
      if (/^\d{3} /.test(line)) {
        const response = this.current.join('\n');
        this.current = [];
        if (this.waiters.length) {
          const waiter = this.waiters.shift();
          clearTimeout(waiter.timer);
          waiter.resolve(response);
        } else {
          this.queue.push(response);
        }
      }
    }
  }

  fail(error) {
    if (this.failure) return;
    this.failure = error;
    while (this.waiters.length) {
      const waiter = this.waiters.shift();
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }

  next(timeoutMs = 15000) {
    if (this.failure) return Promise.reject(this.failure);
    if (this.queue.length) return Promise.resolve(this.queue.shift());

    return new Promise((resolve, reject) => {
      const waiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          this.waiters = this.waiters.filter(item => item !== waiter);
          reject(new Error('SMTP server did not respond before the timeout.'));
        }, timeoutMs),
      };
      this.waiters.push(waiter);
    });
  }
}

function responseCode(response) {
  const finalLine = String(response || '').trim().split('\n').pop() || '';
  return Number(finalLine.slice(0, 3));
}

async function expect(reader, allowed, label) {
  const response = await reader.next();
  const code = responseCode(response);
  if (!allowed.includes(code)) throw new Error(`${label} failed: ${response.replace(/\n/g, ' | ')}`);
}

function writeLine(socket, line) {
  socket.write(`${line}\r\n`);
}

async function loadSettings() {
  const secret = serverSecret();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/service_get_email_settings`, {
    method: 'POST',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_site_key: 'justindematteis' }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.error || 'Unable to load email settings.');
  const settings = Array.isArray(payload) ? payload[0] : payload;

  if (!settings?.enabled) throw new Error('Email notifications are disabled.');
  for (const key of ['smtp_host','smtp_port','smtp_username','smtp_from_email','smtp_password']) {
    if (!settings?.[key]) throw new Error(`Email setting ${key} is not configured.`);
  }
  return settings;
}

function recipientsFor(settings) {
  const routes = Array.isArray(settings.notification_routes) ? settings.notification_routes : [];
  const selected = routes.filter(route => {
    const eventKey = clean(route?.eventKey, 60).toLowerCase();
    return route?.enabled !== false
      && (eventKey === 'service_request' || eventKey === 'all')
      && clean(route?.email, 320);
  });

  const pick = type => [...new Set(selected
    .filter(route => clean(route?.recipientType, 10).toLowerCase() === type)
    .map(route => clean(route?.email, 320).toLowerCase()))];

  let to = pick('to');
  const cc = pick('cc').filter(email => !to.includes(email));
  const bcc = pick('bcc').filter(email => !to.includes(email) && !cc.includes(email));

  if (!to.length && clean(settings.notification_email, 320)) {
    to = [clean(settings.notification_email, 320).toLowerCase()];
  }
  if (!to.length) throw new Error('No Service Requests recipient is configured.');

  return { to, cc, bcc };
}

function buildMessage(settings, record) {
  const recipients = recipientsFor(settings);
  const business = clean(record.company, 160) || 'No company';
  const route = clean(record.ai_primary_service || record.requested_service, 100) || 'Other';
  const secondary = Array.isArray(record.ai_secondary_services) ? record.ai_secondary_services.join(', ') : '';
  const campaign = [record.utm_source, record.utm_medium, record.utm_campaign].filter(Boolean).join(' / ') || 'Not provided';

  const text = [
    'New Service Request',
    '',
    `Name: ${clean(record.name, 160)}`,
    `Company: ${business}`,
    `Email: ${clean(record.email, 320)}`,
    `Phone: ${clean(record.phone, 100) || 'Not provided'}`,
    `Requested service: ${clean(record.requested_service, 100)}`,
    `AI route: ${route}`,
    secondary ? `Secondary: ${secondary}` : '',
    `Priority: ${clean(record.ai_priority, 40)}`,
    `Budget: ${clean(record.budget_range, 100) || 'Not provided'}`,
    `Timeline: ${clean(record.timeline, 100) || 'Not provided'}`,
    `AI summary: ${clean(record.ai_summary, 1000) || 'Not provided'}`,
    '',
    'Project request:',
    clean(record.message, 6000),
    '',
    `Campaign: ${campaign}`,
  ].filter(Boolean).join('\n');

  const html = `<div style="font-family:Arial,sans-serif;background:#f5f6f8;padding:24px;color:#202223">
    <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #dfe3e8;border-radius:14px;overflow:hidden">
      <div style="background:#1f67b2;color:#fff;padding:20px 24px">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.85">Justin DeMatteis</div>
        <h1 style="margin:5px 0 0;font-size:24px">New Service Request</h1>
      </div>
      <div style="padding:24px">
        <p><strong>${escapeHtml(record.name)}</strong>${business !== 'No company' ? ` · ${escapeHtml(business)}` : ''}</p>
        <p>${escapeHtml(record.email)}${record.phone ? ` · ${escapeHtml(record.phone)}` : ''}</p>
        <div style="padding:14px;background:#eef4ff;border-radius:10px;margin:16px 0">
          <strong>${escapeHtml(route)}</strong>
          <div style="margin-top:5px">${escapeHtml(record.ai_summary || '')}</div>
        </div>
        <p><strong>Priority:</strong> ${escapeHtml(record.ai_priority || 'normal')}<br>
        <strong>Budget:</strong> ${escapeHtml(record.budget_range || 'Not provided')}<br>
        <strong>Timeline:</strong> ${escapeHtml(record.timeline || 'Not provided')}<br>
        <strong>Campaign:</strong> ${escapeHtml(campaign)}</p>
        <div style="padding:14px;background:#f7f9fb;border-radius:10px;white-space:pre-wrap">${escapeHtml(record.message)}</div>
      </div>
    </div>
  </div>`;

  return {
    recipients,
    subject: `New Service Request — ${business} — ${clean(record.name, 160)}`,
    text,
    html,
  };
}

async function sendSmtp(settings, mail) {
  const host = clean(settings.smtp_host, 255);
  const port = Number(settings.smtp_port);
  const username = clean(settings.smtp_username, 320);
  const password = String(settings.smtp_password || '');
  const fromEmail = clean(settings.smtp_from_email, 320).toLowerCase();
  const fromName = clean(settings.smtp_from_name, 160).replace(/[\r\n"]/g, '');
  const to = normalizeList(mail.recipients.to);
  const cc = normalizeList(mail.recipients.cc);
  const bcc = normalizeList(mail.recipients.bcc);
  const allRecipients = [...new Set([...to, ...cc, ...bcc])];

  const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: true });
  socket.setTimeout(20000);
  const reader = new SmtpReader(socket);

  const connected = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Unable to connect to SMTP server ${host}:${port}.`)), 20000);
    socket.once('secureConnect', () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    socket.once('timeout', () => {
      clearTimeout(timer);
      socket.destroy();
      reject(new Error(`SMTP connection to ${host}:${port} timed out.`));
    });
  });

  try {
    await connected;
    await expect(reader, [220], 'SMTP greeting');

    writeLine(socket, 'EHLO justindematteis.com');
    await expect(reader, [250], 'SMTP EHLO');

    writeLine(socket, 'AUTH LOGIN');
    await expect(reader, [334], 'SMTP authentication');
    writeLine(socket, Buffer.from(username).toString('base64'));
    await expect(reader, [334], 'SMTP username');
    writeLine(socket, Buffer.from(password).toString('base64'));
    await expect(reader, [235], 'SMTP password');

    writeLine(socket, `MAIL FROM:<${fromEmail}>`);
    await expect(reader, [250], 'SMTP sender');

    for (const recipient of allRecipients) {
      writeLine(socket, `RCPT TO:<${recipient}>`);
      await expect(reader, [250,251], `SMTP recipient ${recipient}`);
    }

    writeLine(socket, 'DATA');
    await expect(reader, [354], 'SMTP DATA');

    const boundary = `----=_Justin_${Date.now()}`;
    const headers = [
      `From: "${fromName}" <${fromEmail}>`,
      `To: ${to.join(', ')}`,
      cc.length ? `Cc: ${cc.join(', ')}` : '',
      `Reply-To: ${clean(recordForReplyTo?.email || '', 320)}`,
      `Subject: ${mail.subject}`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ].filter(Boolean);

    const raw = [
      headers.join('\r\n'),
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      mail.text,
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      mail.html,
      `--${boundary}--`,
      '',
    ].join('\r\n').replace(/(^|\r\n)\./g, '$1..');

    socket.write(`${raw}\r\n.\r\n`);
    await expect(reader, [250], 'SMTP delivery');
    writeLine(socket, 'QUIT');
    await expect(reader, [221], 'SMTP QUIT').catch(() => null);
  } finally {
    socket.end();
    socket.destroy();
  }
}

let recordForReplyTo = null;

async function updateNotificationStatus(id, patch) {
  const secret = serverSecret();
  await fetch(`${SUPABASE_URL}/rest/v1/service_requests?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
}

export async function notifyServiceRequest(record) {
  if (!record?.id) return;
  recordForReplyTo = record;

  await updateNotificationStatus(record.id, {
    email_notification_attempted_at: new Date().toISOString(),
    email_notification_error: null,
  });

  try {
    const settings = await loadSettings();
    const mail = buildMessage(settings, record);
    await sendSmtp(settings, mail);
    await updateNotificationStatus(record.id, {
      email_notified_at: new Date().toISOString(),
      email_notification_error: null,
    });
  } catch (error) {
    const message = clean(error?.message || error, 1000) || 'Email notification failed.';
    await updateNotificationStatus(record.id, { email_notification_error: message });
    throw error;
  } finally {
    recordForReplyTo = null;
  }
}
