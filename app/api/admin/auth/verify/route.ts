// app/api/admin/auth/verify/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    const auth = await verifyAdminToken(token);

    if (!auth.valid) {
      return NextResponse.json(
        { authenticated: false, message: 'الجلسة غير صالحة أو منتهية' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: auth.email,
        role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'تعذر التحقق من الجلسة' },
      { status: 500 }
    );
  }
}
