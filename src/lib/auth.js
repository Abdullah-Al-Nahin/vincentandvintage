import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '180055';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vv-secret-atelier-auth-key-2026-v1';
const COOKIE_NAME = 'vv_admin_session';

// Token generation: username:timestamp:signature
export function createAdminToken(username) {
  const timestamp = Date.now();
  const data = `${username}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  return `${data}:${signature}`;
}

// Token verification
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [username, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Expire after 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const expectedData = `${username}:${timestampStr}`;
  const expectedSignature = crypto.createHmac('sha256', ADMIN_SECRET).update(expectedData).digest('hex');

  // Constant-time comparison
  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

// Validate credentials
export function validateAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Helper for Next.js route handlers
export function verifyAdminSession(request) {
  // Check cookie first
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const cookieToken = match ? decodeURIComponent(match[1]) : null;

  if (cookieToken && verifyAdminToken(cookieToken)) {
    return true;
  }

  // Check Authorization header fallback: Bearer <token>
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // Check x-admin-token fallback
  const customHeader = request.headers.get('x-admin-token');
  if (customHeader && verifyAdminToken(customHeader)) {
    return true;
  }

  return false;
}

export { COOKIE_NAME, ADMIN_USERNAME };

