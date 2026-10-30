'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FaFacebook,
    FaInstagram,
    FaXTwitter,
    FaTiktok,
    FaTelegram,
} from 'react-icons/fa6';
import {
    MdEmail,
    MdPhone,
    MdLocationOn,
} from 'react-icons/md';
import { StoreSettings } from '@/types';

export default function Footer() {
    const pathname = usePathname();
    const [settings, setSettings] = useState<StoreSettings | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && data.settings) {
                    setSettings(data.settings);
                }
            })
            .catch((err) => console.error('Error fetching footer settings:', err));

        return () => {
            isMounted = false;
        };
    }, []);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const storeName = settings?.storeName || 'متجر الواسطة';
    const storeDesc = settings?.storeDescription || 'وجهتك الأولى لأحدث الهواتف الذكية والإلكترونيات والملحقات الأصلية بأسعار منافسة وضمان حقيقي.';
    const storePhone = settings?.storePhone || settings?.whatsappNumber || '+967 771 211 394';
    const storeEmail = settings?.storeEmail || 'support@alwasita.net';
    const storeAddress = settings?.storeAddress || 'اليمن - حضرموت / صنعاء / عدن';

    return (
        <footer className="bg-[#121215] text-gray-400 border-t border-gray-800 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* العمود 1: معلومات المتجر والشعار */}
                    <div className="space-y-4">
                        <h3 className="text-white text-xl font-extrabold tracking-tight">
                            {storeName}
                        </h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            {storeDesc}
                        </p>

                        {/* أيقونات التواصل الاجتماعي الديناميكية */}
                        <div className="flex items-center gap-2.5 pt-2 flex-wrap">
                            {settings?.facebookUrl && (
                                <a
                                    href={settings.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                    aria-label="Facebook"
                                    title="فيسبوك"
                                >
                                    <FaFacebook className="w-4 h-4" />
                                </a>
                            )}
                            {settings?.instagramUrl && (
                                <a
                                    href={settings.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all"
                                    aria-label="Instagram"
                                    title="انستغرام"
                                >
                                    <FaInstagram className="w-4 h-4" />
                                </a>
                            )}
                            {settings?.twitterUrl && (
                                <a
                                    href={settings.twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-all"
                                    aria-label="X / Twitter"
                                    title="إكس (تويتر)"
                                >
                                    <FaXTwitter className="w-4 h-4" />
                                </a>
                            )}
                            {settings?.tiktokUrl && (
                                <a
                                    href={settings.tiktokUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                                    aria-label="TikTok"
                                    title="تيك توك"
                                >
                                    <FaTiktok className="w-4 h-4" />
                                </a>
                            )}
                            {settings?.telegramUrl && (
                                <a
                                    href={settings.telegramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"
                                    aria-label="Telegram"
                                    title="تيليجرام"
                                >
                                    <FaTelegram className="w-4 h-4" />
                                </a>
                            )}
                            {!settings?.facebookUrl && !settings?.instagramUrl && !settings?.twitterUrl && !settings?.tiktokUrl && !settings?.telegramUrl && (
                                <>
                                    <span className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer">
                                        <FaFacebook className="w-4 h-4" />
                                    </span>
                                    <span className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer">
                                        <FaInstagram className="w-4 h-4" />
                                    </span>
                                    <span className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer">
                                        <FaXTwitter className="w-4 h-4" />
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* العمود 2: روابط سريعة */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-base">روابط سريعة</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-[var(--color-primary-soft)] transition">
                                    عن المتجر
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-[var(--color-primary-soft)] transition">
                                    جميع المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/offers" className="hover:text-[var(--color-primary-soft)] transition">
                                    العروض والخصومات
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-[var(--color-primary-soft)] transition flex items-center gap-1.5">
                                    <span>المدونة التقنية</span>
                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-900/60 text-purple-300 font-bold">جديد</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* العمود 3: خدمة العملاء */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-base">خدمة العملاء</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/faq" className="hover:text-[var(--color-primary-soft)] transition">
                                    الأسئلة الشائعة
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="hover:text-[var(--color-primary-soft)] transition">
                                    الشحن والتوصيل
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="hover:text-[var(--color-primary-soft)] transition">
                                    سياسة الإرجاع
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-[var(--color-primary-soft)] transition">
                                    اتصل بنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* العمود 4: معلومات التواصل */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-base">تواصل معنا</h4>
                        <ul className="space-y-3.5 text-sm">
                            {storePhone && (
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                        <MdPhone className="w-4 h-4" />
                                    </div>
                                    <span dir="ltr" className="text-gray-300 font-medium">{storePhone}</span>
                                </li>
                            )}
                            {storeEmail && (
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                        <MdEmail className="w-4 h-4" />
                                    </div>
                                    <a
                                        href={`mailto:${storeEmail}`}
                                        className="text-gray-300 hover:text-white transition break-all"
                                    >
                                        {storeEmail}
                                    </a>
                                </li>
                            )}
                            {storeAddress && (
                                <li className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                                        <MdLocationOn className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-300">{storeAddress}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                </div>

                {/* حقوق النشر والنسخ والسياسات */}
                <div className="border-t border-gray-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-gray-300 transition">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-gray-300 transition">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}