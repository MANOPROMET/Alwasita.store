// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();

  // 1. استخراج وتمرير عنوان IP العميل الحقيقي من Cloudflare للتحليل الأمني الداخلي
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-client-ip', clientIp);

  // 2. استثناء صفحة تسجيل الدخول ومسارات مصادقة المدير من الفحص
  if (
    lowerPath === '/admin/login' ||
    lowerPath.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. التحقق المشفر من توكن الجلسة الإدارية
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const auth = await verifyAdminToken(token);

  if (!auth.valid) {
    // أ) إذا كان الطلب مسار API للإدارة: إرجاع خطأ 401 محمي
    if (lowerPath.startsWith('/api/admin/') || lowerPath === '/api/admin') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول كمدير.' },
        {
          status: 401,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    // ب) إذا كان الطلب صفحات لوحة التحكم: إعادة التوجيه الآمن لصفحة تسجيل الدخول (مع حماية Open Redirect)
    const loginUrl = new URL('/admin/login', request.url);
    const safeRedirect = pathname.startsWith('/admin') ? pathname : '/admin';
    loginUrl.searchParams.set('redirect', safeRedirect);

    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set('X-Content-Type-Options', 'nosniff');
    redirectResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
    return redirectResponse;
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
