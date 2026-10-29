// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. استثناء صفحة تسجيل الدخول ومسارات التحقق من الحماية
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next();
  }

  // 2. التحقق من توكن الجلسة الإدارية
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const auth = await verifyAdminToken(token);

  if (!auth.valid) {
    // أ) إذا كان الطلب مسار API للإدارة: إرجاع خطأ 401
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول كمدير.' },
        { status: 401 }
      );
    }

    // ب) إذا كان الطلب صفحات لوحة التحكم: إعادة التوجيه الفوري لصفحة تسجيل الدخول
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
