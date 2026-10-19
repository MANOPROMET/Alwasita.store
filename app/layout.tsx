// app/layout.tsx
import type { Metadata } from 'next';
import { Tajawal, Cairo } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsappButton from './components/WhatsappButton';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';

// تهيئة الخطوط العربية
const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
});

// معلومات الموقع (SEO)
export const metadata: Metadata = {
  title: {
    default: 'متجر الواسطة | أفضل المنتجات بأفضل الأسعار',
    template: '%s | متجر الواسطة',
  },
  description: 'تسوق أفضل المنتجات الأصلية مع ضمان الجودة وخدمة ما بعد البيع',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <body className="font-tajawal min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <AuthProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <CartProvider>
                {/* الهيدر */}
                <Header />

                {/* المحتوى الرئيسي */}
                <main className="site-main flex-1">
                  {children}
                </main>

                {/* الفوتر */}
                <Footer />

                {/* زر الواتساب العائم */}
                <WhatsappButton />
              </CartProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}