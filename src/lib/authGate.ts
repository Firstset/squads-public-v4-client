const SECRET = process.env.FRONTEND_AUTH_SECRET ?? '';

export const authEnabled = SECRET.trim().length > 0;

export const COOKIE_NAME = 'vault_frontend_auth_session';
export const CHANNEL_NAME = 'vault_frontend_auth_sync';

function djb2(s: string): string {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 33) ^ s.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export const SESSION_VALUE = `v1:${djb2(SECRET)}`;

function decodeCookieValue(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function readCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const c of cookies) {
    const eq = c.indexOf('=');
    if (eq === -1) continue;
    if (c.slice(0, eq) === COOKIE_NAME) {
      return decodeCookieValue(c.slice(eq + 1));
    }
  }
  return null;
}

function cookieAttrs(): string[] {
  const attrs = ['Path=/', 'SameSite=Lax'];
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    attrs.push('Secure');
  }
  return attrs;
}

export function writeCookie(value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = [`${COOKIE_NAME}=${encodeURIComponent(value)}`, ...cookieAttrs()].join('; ');
}

export function clearCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = [`${COOKIE_NAME}=`, ...cookieAttrs(), 'Max-Age=0'].join('; ');
}

export function isAuthedFromCookie(): boolean {
  return readCookie() === SESSION_VALUE;
}

export function checkPassword(input: string): boolean {
  return input === SECRET;
}
