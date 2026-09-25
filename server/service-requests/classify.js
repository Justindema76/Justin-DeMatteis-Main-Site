const SERVICE_LABELS = {
  website_wordpress: 'Website / WordPress',
  wordpress_plugin: 'Custom WordPress Plugin',
  shopify_ecommerce: 'Shopify / Ecommerce',
  ai_automation: 'AI Automation',
  api_integration: 'API Integration',
  custom_web_app: 'Custom Web App',
  seo_digital: 'SEO / Digital Marketing',
  other: 'Other / Discovery',
};

const ALLOWED_SERVICES = new Set(Object.keys(SERVICE_LABELS));

function keywordClassification(message = '') {
  const text = message.toLowerCase();
  const matches = [];

  if (/wordpress|elementor|woocommerce|plugin/.test(text)) matches.push('website_wordpress');
  if (/wordpress plugin|custom plugin|wp plugin/.test(text)) matches.unshift('wordpress_plugin');
  if (/shopify|ecommerce|e-commerce|online store|pos/.test(text)) matches.push('shopify_ecommerce');
  if (/automation|automate|ai |artificial intelligence|claude|chatgpt|openai|agent/.test(text)) matches.push('ai_automation');
  if (/api|webhook|integration|connect .* system|crm/.test(text)) matches.push('api_integration');
  if (/web app|dashboard|portal|internal tool|application/.test(text)) matches.push('custom_web_app');
  if (/seo|search engine|google ads|analytics|marketing/.test(text)) matches.push('seo_digital');

  return [...new Set(matches)];
}

function priorityFromInput(input) {
  if (input.timeline === 'asap') return 'high';
  if (input.budget === '25000_plus' || input.budget === '10000_25000') return 'high';
  if (input.timeline === '30_days') return 'normal';
  return 'normal';
}

function cleanJsonText(value = '') {
  return String(value)
    .trim()
    .replace(/^\`\`\`json\s*/i, '')
    .replace(/^\`\`\`/, '')
    .replace(/\`\`\`$/, '')
    .trim();
}

function responseText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;

  return (payload?.output || [])
    .flatMap(item => item?.content || [])
    .filter(item => item?.type === 'output_text' && typeof item?.text === 'string')
    .map(item => item.text)
    .join('\n');
}

async function classifyWithOpenAI(input) {
  if (!process.env.OPENAI_API_KEY) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const safeContext = {
    selected_service: input.service,
    budget: input.budget,
    timeline: input.timeline,
    message: input.message,
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: [
        'Classify inbound project requests for a web development and automation consultancy.',
        'Return JSON only.',
        'Do not make pricing promises or sales decisions.',
        'Allowed primary_service values: website_wordpress, wordpress_plugin, shopify_ecommerce, ai_automation, api_integration, custom_web_app, seo_digital, other.',
        'Allowed priority values: low, normal, high.',
        'Return: primary_service, secondary_services (array), priority, summary (max 160 chars), confidence (0 to 1).',
        'Use only the project details supplied. Personal contact details are intentionally excluded.',
      ].join(' '),
      input: JSON.stringify(safeContext),
    }),
  });

  if (!response.ok) throw new Error(`AI classification failed with status ${response.status}`);

  const payload = await response.json();
  const raw = cleanJsonText(responseText(payload));
  if (!raw) throw new Error('AI classification returned no text');

  const parsed = JSON.parse(raw);
  const primary = ALLOWED_SERVICES.has(parsed.primary_service) ? parsed.primary_service : 'other';
  const secondary = Array.isArray(parsed.secondary_services)
    ? parsed.secondary_services.filter(item => ALLOWED_SERVICES.has(item) && item !== primary).slice(0, 3)
    : [];

  return {
    provider: 'openai',
    model,
    primary_service: primary,
    secondary_services: secondary,
    priority: ['low', 'normal', 'high'].includes(parsed.priority) ? parsed.priority : 'normal',
    summary: String(parsed.summary || '').slice(0, 160),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
  };
}

export async function classifyServiceRequest(input) {
  const explicitService = input.service && input.service !== 'not_sure' && ALLOWED_SERVICES.has(input.service)
    ? input.service
    : null;

  let ai = null;
  try {
    ai = await classifyWithOpenAI(input);
  } catch (error) {
    console.error('AI service-request classification failed; using rules fallback.', error);
  }

  const keywordMatches = keywordClassification(input.message);
  const primary = explicitService || ai?.primary_service || keywordMatches[0] || 'other';
  const secondary = [
    ...(ai?.secondary_services || []),
    ...keywordMatches,
  ].filter((value, index, array) => value !== primary && array.indexOf(value) === index).slice(0, 3);

  const summary = ai?.summary || String(input.message || '').replace(/\s+/g, ' ').trim().slice(0, 160);

  return {
    provider: ai?.provider || 'rules',
    model: ai?.model || null,
    primary_service: primary,
    primary_service_label: SERVICE_LABELS[primary] || SERVICE_LABELS.other,
    secondary_services: secondary,
    priority: ai?.priority || priorityFromInput(input),
    summary,
    confidence: ai?.confidence ?? (explicitService ? 1 : keywordMatches.length ? 0.65 : 0.25),
    queue: primary,
  };
}
