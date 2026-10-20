'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { account } from '@/lib/appwrite/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const userId = searchParams?.get('userId');
    const secret = searchParams?.get('secret');

    if (!userId || !secret) {
      setStatus('error');
      setErrorText('بيانات المصادقة مفقودة من الرابط');
      return;
    }

    const createSession = async () => {
      try {
        await account.createSession({ userId, secret });
        setStatus('success');
        setTimeout(() => {
          router.replace('/account');
        }, 1200);
      } catch (err: any) {
        console.error('Failed to create OAuth session:', err);
        setStatus('error');
        setErrorText(err?.message || 'تعذر إنشاء جلسة الدخول');
      }
    };

    createSession();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-xl text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto" />
            <h2 className="text-lg font-black text-gray-900">جاري تسجيل الدخول عبر Google...</h2>
            <p className="text-xs text-gray-500">يرجى الانتظار لحظات لتأكيد وتوثيق حسابك</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-lg font-black text-gray-900">تم تسجيل الدخول بنجاح!</h2>
            <p className="text-xs text-gray-500">جاري تحويلك إلى صفحة حسابك...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-black text-gray-900">تعذر تسجيل الدخول</h2>
            <p className="text-xs text-rose-600">{errorText}</p>
            <div className="pt-2">
              <Link
                href="/account"
                className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl"
              >
                العودة لصفحة الحساب
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
