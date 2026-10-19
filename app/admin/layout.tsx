import React from 'react';
import type { Metadata } from 'next';
import AdminLayoutWrapper from './AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'لوحة التحكم | متجر الواسطة',
  description: 'إدارة متجر الواسطة الإلكتروني',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
