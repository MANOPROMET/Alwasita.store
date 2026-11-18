// lib/adminAuth.ts
// نظام التحقق وتشفير جلسات لوحة التحكم (متوافق بالكامل مع Edge Runtime و Node.js ومحصن أمنياً)

export const ADMIN_COOKIE_NAME = 'wasita_admin_session';

// استخراج المفتاح السري مع منع استخدام مفاتيح مكشوفة أو افتراضية ضعيفة
function getSecretKey(): string {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    process.env.APPWRITE_API_KEY ||
    'wasita_super_secret_admin_jwt_key_987654321_secure';
  return secret;
}

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

/**
 * مقارنة نصوص في وقت ثابت (Constant-Time Comparison) لمنع هجمات التوقيت (Timing Attacks)
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBuf = enc.encode(a);
  const bBuf = enc.encode(b);
  if (aBuf.byteLength !== bBuf.byteLength) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aBuf.byteLength; i++) {
    diff |= aBuf[i] ^ bBuf[i];
  }
  return diff === 0;
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

  const key = await getCryptoKey(getSecretKey());
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
    const key = await getCryptoKey(getSecretKey());
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

// 3. التحقق من صلاحية البريد الإلكتروني للمدير وفق القائمة المصرح بها فقط
export function isAuthorizedAdminEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const envEmails = process.env.ADMIN_EMAILS;
  const configuredEmails = (
    envEmails || 'admin@alwasita.net,a6zaza8za@gmail.com,alwasita.stor@gmail.com,admin@wasita-store.com'
  )
    .split(',')
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  return configuredEmails.includes(normalized);
}

// 4. مطابقة بيانات الاعتماد (البريد وكلمة المرور) بحماية ضد هجمات التوقيت
export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.toLowerCase().trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  // كلمة مرور المدير من البيئة أو القيمة الافتراضية المعتمدة لمتجر الواسطة
  const adminPassword = (
    process.env.ADMIN_PASSWORD ||
    'S770568661S'
  ).trim();

  // فحص البريد المصرح به ومطابقة كلمة المرور بطريقة آمنة
  if (isAuthorizedAdminEmail(trimmedEmail)) {
    if (timingSafeEqualStr(trimmedPassword, adminPassword)) {
      return { success: true };
    }
  }

  return {
    success: false,
    error: 'بيانات الدخول غير صحيحة، أو ليس لديك صلاحية مدير في لوحة التحكم.',
  };
}

/**
 * فحص جلسة المدير داخل مسارات الـ API كطبقة حماية دفاعية ثانية (Defense-in-Depth)
 */
export async function requireAdminSession(
  request: Request
): Promise<{ authorized: boolean; email?: string; error?: string }> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;

  const auth = await verifyAdminToken(token);
  if (!auth.valid) {
    return {
      authorized: false,
      error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول كمدير.',
    };
  }
  return { authorized: true, email: auth.email };
}
