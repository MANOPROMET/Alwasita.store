// app/api/admin/auth/login/route.ts
import { NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createAdminToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
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

    // إنشاء التوكن الإداري الموقّع
    const token = await createAdminToken(email);

    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        email: email.toLowerCase().trim(),
        role: 'admin',
      },
    });

    // تعيين الكوكي المشفرة والآمنة (HttpOnly)
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
