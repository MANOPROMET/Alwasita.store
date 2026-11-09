// app/api/admin/auth/login/route.ts
import { NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. فحص معدل المحاولات (الحد من هجمات التخمين Brute-force): 5 محاولات لكل 15 دقيقة
    const rateCheck = checkRateLimit(`admin-login:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز الحد المسموح به للمحاولات. يرجى الانتظار لمدة ${Math.ceil(waitSeconds / 60)} دقيقة قبل المحاولة مجدداً.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(waitSeconds),
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const authResult = await validateAdminCredentials(email, password);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء التوكن الإداري الموقّع رقمياً
    const token = await createAdminToken(email);

    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        email: email.toLowerCase().trim(),
        role: 'admin',
      },
    });

    const isSecure =
      process.env.NODE_ENV === 'production' ||
      request.url.startsWith('https') ||
      request.headers.get('x-forwarded-proto') === 'https';

    // تعيين الكوكي الآمنة والمشفرة مع نفس الموقع الصارم للحماية من هجمات CSRF
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
