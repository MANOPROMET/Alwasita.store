import type { NextConfig } from "next";

const securityHeaders = [
  // 1. سياسة أمان المحتوى الصارمة المتوافقة مع Cloudflare و Appwrite و WhatsApp
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://images.unsplash.com https://cloud.appwrite.io https://fra.cloud.appwrite.io https://*.appwrite.io",
      "font-src 'self' data:",
      "connect-src 'self' https://cloud.appwrite.io https://fra.cloud.appwrite.io https://*.appwrite.io https://cloudflareinsights.com https://static.cloudflareinsights.com",
      "media-src 'self' blob: https://cloud.appwrite.io https://fra.cloud.appwrite.io",
      "frame-src 'self' https://challenges.cloudflare.com https://api.whatsapp.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.whatsapp.com",
    ].join('; '),
  },
  // 2. إجبار بروتوكول HTTPS المشفر (HSTS) لربط Cloudflare Full / Strict SSL
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // 3. منع استنشاق وتزييف أنواع الملفات (MIME-type sniffing)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 4. حماية من هجمات الاختطاف بالنقرات وتضمين الإطارات (Clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // 5. سياسة الإحالة للحد من تسريب الروابط لخدمات خارجية
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 6. تعطيل وصول المتصفح للحساسات والكاميرا والميكروفون غير المطلوبة
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // 7. تسريع وترشيد الاستعلام عن الـ DNS
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // 8. عزل سياق التصفح لمنع ثغرات Cross-Origin Leaks
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
];

const nextConfig: NextConfig = {
  // إخفاء ترويسة X-Powered-By لحجب بصمة السيرفر والتقنية عن الفاحصين
  poweredByHeader: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
      },
    ],
  },

  // تطبيق ترويسات الحماية المتقدمة على جميع المسارات
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
