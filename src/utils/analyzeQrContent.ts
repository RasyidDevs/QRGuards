export interface AnalysisResult {
  status: 'SAFE' | 'DANGEROUS';
  reasons: string[];
}

const SHORTLINK_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  's.id',
  'cutt.ly',
  'shorturl.at',
  'q.me-qr.com',
  'me-qr.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
];

const SUSPICIOUS_KEYWORDS = [
  'login',
  'verify',
  'update',
  'secure',
  'account',
  'password',
  'bank',
  'confirm',
  'free',
  'bonus',
  'hadiah',
  'qris',
  'payment',
  'wallet',
  'claim',
  'prize',
];

const MAX_URL_LENGTH = 200;

function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Regex = /^\[?[0-9a-fA-F:]+\]?$/;
  return ipv4Regex.test(hostname) || ipv6Regex.test(hostname);
}

export function analyzeQrContent(content: string): AnalysisResult {
  const reasons: string[] = [];

  // Check if it's a valid URL
  if (!isValidUrl(content)) {
    return {
      status: 'DANGEROUS',
      reasons: ['QR content is not a verifiable URL.'],
    };
  }

  const url = new URL(content);

  // Check HTTPS
  if (url.protocol !== 'https:') {
    reasons.push('URL does not use HTTPS.');
  }

  // Check for shortlink domains
  const hostname = url.hostname.toLowerCase();
  const isShortlink = SHORTLINK_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith('.' + domain)
  );
  if (isShortlink) {
    reasons.push('URL uses a shortlink or QR redirect service.');
  }

  // Check for suspicious keywords
  const urlLower = content.toLowerCase();
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter((keyword) =>
    urlLower.includes(keyword)
  );
  if (foundKeywords.length > 0) {
    reasons.push('URL contains suspicious keywords.');
  }

  // Check URL length
  if (content.length > MAX_URL_LENGTH) {
    reasons.push('URL is unusually long.');
  }

  // Check for IP address
  if (isIpAddress(url.hostname)) {
    reasons.push('URL uses an IP address instead of a normal domain.');
  }

  // Determine status
  if (reasons.length > 0) {
    return { status: 'DANGEROUS', reasons };
  }

  return {
    status: 'SAFE',
    reasons: ['URL uses HTTPS and no suspicious pattern was detected.'],
  };
}
