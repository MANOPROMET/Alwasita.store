// app/api/admin/license/generate/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

const SECRET_SALT = 'AlwastaPOS_Secure_2026_SecretKey';

export function calculateLicenseKey(machineId: string): string {
  const rawId = machineId.trim().toUpperCase();
  const hash = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(rawId)
    .digest('hex')
    .toUpperCase();

  const part1 = hash.substring(0, 4);
  const part2 = hash.substring(4, 8);
  const part3 = hash.substring(8, 12);

  return `ACT-${part1}-${part2}-${part3}`;
}

export async function POST(req: Request) {
  try {
    // التحقق من صلاحيات المدير
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const auth = await verifyAdminToken(token);

    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بتوليد الأكواد. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { machineId, customerName, notes } = body;

    if (!machineId || typeof machineId !== 'string' || !machineId.trim()) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال معرّف الجهاز (Machine ID) بشكل صحيح.' },
        { status: 400 }
      );
    }

    const normalizedId = machineId.trim().toUpperCase();
    const licenseKey = calculateLicenseKey(normalizedId);

    return NextResponse.json({
      success: true,
      licenseKey,
      machineId: normalizedId,
      customerName: customerName ? String(customerName).trim() : '',
      notes: notes ? String(notes).trim() : '',
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('License generation error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء معالجة وتوليد كود التفعيل.' },
      { status: 500 }
    );
  }
}
