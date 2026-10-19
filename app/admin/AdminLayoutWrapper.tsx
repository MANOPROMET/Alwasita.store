'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminNav from './components/AdminNav';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <AdminNav />
      <main className="animate-fade-in">{children}</main>
    </div>
  );
}
