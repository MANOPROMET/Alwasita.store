'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/lib/appwrite/client';
import { OAuthProvider, Models, ID } from 'appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  createSessionFromOAuth: (userId: string, secret: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; phone?: string; city?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

// مانع تكرار استهلاك الرمز في وضع التطوير والتحديث المتكرر
const processedOAuthTokens = new Set<string>();

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const success = `${origin}/auth/success`;
      const failure = `${origin}/auth/failure`;

      // استخدام OAuth2 Token Flow الحديث المعتمد من Appwrite لضمان عدم حظر الكوكيز
      await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success,
        failure,
      });
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      if (err?.code === 412 || err?.type === 'project_provider_disabled') {
        setAuthError('مزود Google غير مفعل حالياً في لوحة تحكم Appwrite.');
      } else {
        setAuthError(err?.message || 'تعذر بدء تسجيل الدخول عبر Google');
      }
      throw err;
    }
  };

  const createSessionFromOAuth = async (userId: string, secret: string) => {
    const tokenKey = `${userId}:${secret}`;
    if (processedOAuthTokens.has(tokenKey)) {
      // تم البدء في معالجة هذا الرمز مسبقاً، نكتفي بتحديث بيانات المستخدم
      await refreshUser();
      return;
    }
    processedOAuthTokens.add(tokenKey);

    setAuthError(null);
    try {
      // 1. التحقق أولاً مما إذا كانت هناك جلسة نشطة بالفعل لهذا المستخدم
      try {
        const currentUser = await account.get();
        if (currentUser && currentUser.$id === userId) {
          setUser(currentUser);
          return;
        }
      } catch {
        // لا توجد جلسة نشطة، نواصل الإنشاء
      }

      // 2. إنشاء الجلسة باستخدام الـ userId والـ secret
      await account.createSession({ userId, secret });
      await refreshUser();
    } catch (err: any) {
      // 3. في حال كان الخطأ "Invalid token passed in the request"،
      // نتحقق مما إذا كان الطلب المتزامن قد أنشأ الجلسة بالفعل واستهلك الرمز ذي الاستخدام الواحد
      try {
        const verifiedUser = await account.get();
        if (verifiedUser) {
          setUser(verifiedUser);
          setAuthError(null);
          return;
        }
      } catch {
        // فشل حقيقي
      }

      console.error('OAuth session creation error:', err);
      setAuthError(err?.message || 'تعذر إتمام جلسة تسجيل الدخول عبر Google');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      // إنهاء أي جلسة سابقة تجنباً لخطأ session active
      try {
        await account.deleteSession('current');
      } catch {
        // لا مشكلة إذا لم تكن هناك جلسة
      }

      await account.createEmailPasswordSession(email.trim(), password);
      await refreshUser();
    } catch (err: any) {
      console.error('Email login error:', err);
      const msg =
        err?.message?.includes('Invalid credentials') || err?.code === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : err?.message || 'حدث خطأ أثناء تسجيل الدخول';
      setAuthError(msg);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, phone?: string) => {
    setAuthError(null);
    try {
      await account.create(ID.unique(), email.trim(), password, name.trim());
      // تسجيل الدخول مباشرة بعد إنشاء الحساب
      await account.createEmailPasswordSession(email.trim(), password);
      // حفظ رقم الهاتف في التفضيلات إن وجد
      if (phone && phone.trim()) {
        try {
          await account.updatePrefs({ phone: phone.trim() });
        } catch (e) {
          console.warn('Could not save phone to user prefs:', e);
        }
      }
      await refreshUser();
    } catch (err: any) {
      console.error('Email registration error:', err);
      let msg = err?.message || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً';
      if (err?.code === 409 || err?.type === 'user_already_exists') {
        msg = 'البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.';
      } else if (err?.message?.includes('Password must be')) {
        msg = 'كلمة المرور يجب أن تكون 8 خانات على الأقل.';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; city?: string; address?: string }) => {
    setAuthError(null);
    try {
      if (data.name && data.name.trim() && data.name.trim() !== user?.name) {
        await account.updateName(data.name.trim());
      }
      const currentPrefs = (user?.prefs as Record<string, any>) || {};
      const newPrefs = {
        ...currentPrefs,
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.city !== undefined ? { city: data.city.trim() } : {}),
        ...(data.address !== undefined ? { address: data.address.trim() } : {}),
      };
      await account.updatePrefs(newPrefs);
      await refreshUser();
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      setAuthError(err?.message || 'تعذر تحديث بيانات الحساب');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        createSessionFromOAuth,
        loginWithEmail,
        registerWithEmail,
        updateUserProfile,
        logout,
        refreshUser,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
