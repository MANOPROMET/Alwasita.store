// lib/adminAuth.ts
// نظام التحقق وتشفير جلسات لوحة التحكم (متوافق بالكامل مع Edge Runtime و Node.js)

export const ADMIN_COOKIE_NAME = 'wasita_admin_session';

const DEFAULT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.APPWRITE_API_KEY ||
  'wasita-admin-secret-key-default-2026';

// دالة توليد مفتاح HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// ترميز Base64Url
function base64UrlEncode(str: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// فك ترميز Base64Url
function base64UrlDecode(str: string): string {
  let m = str.replace(/-/g, '+').replace(/_/g, '/');
  while (m.length % 4) {
    m += '=';
  }
  const binary = atob(m);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const dec = new TextDecoder();
  return dec.decode(bytes);
}

// 1. إنشاء توكن جلسة المدير الموقّع رقمياً
export async function createAdminToken(email: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    email: email.toLowerCase().trim(),
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // صالح لمدة 7 أيام
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  const key = await getCryptoKey(DEFAULT_SECRET);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));

  let signatureBinary = '';
  const sigBytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < sigBytes.byteLength; i++) {
    signatureBinary += String.fromCharCode(sigBytes[i]);
  }
  const signatureEncoded = btoa(signatureBinary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${dataToSign}.${signatureEncoded}`;
}

// 2. التحقق من صحة وصلاحية توكن المدير
export async function verifyAdminToken(
  token?: string | null
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== 'string') return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  try {
    const key = await getCryptoKey(DEFAULT_SECRET);
    const enc = new TextEncoder();

    let sigStr = signatureEncoded.replace(/-/g, '+').replace(/_/g, '/');
    while (sigStr.length % 4) sigStr += '=';
    const sigBinary = atob(sigStr);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(dataToSign));
    if (!isValid) return { valid: false };

    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false }; // الجلسة منتهية
    }

    if (payload.role !== 'admin') {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

// 3. التحقق من صلاحية البريد الإلكتروني للمدير
export function isAuthorizedAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const configuredEmails = (
    process.env.ADMIN_EMAILS || 'admin@alwasita.net,a6zaza8za@gmail.com,admin@wasita-store.com'
  )
    .split(',')
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  return configuredEmails.includes(normalized);
}

// 4. مطابقة بيانات الاعتماد (البريد وكلمة المرور)
export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.toLowerCase().trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const adminPassword = (process.env.ADMIN_PASSWORD || 'wasita@admin2026').trim();

  // فحص البريد المصرح به ومطابقة كلمة المرور
  if (isAuthorizedAdminEmail(trimmedEmail)) {
    if (trimmedPassword === adminPassword) {
      return { success: true };
    }
  }

  // فحص إضافي للحسابات الإدارية الافتراضية
  if (
    trimmedEmail === 'admin@wasita-store.com' ||
    trimmedEmail === 'admin@alwasita.net'
  ) {
    if (trimmedPassword === adminPassword) {
      return { success: true };
    }
  }

  return {
    success: false,
    error: 'بيانات الدخول غير صحيحة، أو ليس لديك صلاحية مدير في لوحة التحكم.',
  };
}
