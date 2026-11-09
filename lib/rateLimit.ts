// lib/rateLimit.ts
// نظام حماية ضد هجمات التخمين والحرمان من الخدمة (DDoS / Brute-force) متوافق بالكامل مع Cloudflare

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// تخزين محلي بذاكرة السيرفر المؤقتة
const memoryStore = new Map<string, RateLimitRecord>();

// تنظيف دوري للذاكرة كل 5 دقائق لمنع تسرب الذاكرة
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * استخراج عنوان IP الحقيقي للعميل مع أولوية ترويسات Cloudflare الموثوقة
 */
export function getClientIp(request: Request): string {
  // 1. ترويسة Cloudflare المعتمدة والمشفرة من السيرفر الوسيط
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) {
    return cfIp.trim();
  }

  // 2. ترويسات البروكسي والشبكة البديلة
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return '127.0.0.1';
}

/**
 * استخراج بيانات تتبع Cloudflare (Ray ID والدولة) للتدقيق الأمني
 */
export function getCloudflareMetadata(request: Request): {
  rayId: string | null;
  country: string | null;
  clientIp: string;
} {
  return {
    rayId: request.headers.get('cf-ray'),
    country: request.headers.get('cf-ipcountry'),
    clientIp: getClientIp(request),
  };
}

/**
 * فحص معدل الطلبات للحد من الهجمات
 * @param key معرف العملية (مثل: login:192.168.1.1)
 * @param limit الحد الأقصى المسموح به
 * @param windowMs النافذة الزمنية بالمللي ثانية
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    // نافذة جديدة
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: resetAt,
    };
  }

  // نافذة حالية
  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetAt,
  };
}

