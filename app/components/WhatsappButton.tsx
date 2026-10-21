// app/components/WhatsappButton.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsappButton() {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const phoneNumber = '+967771211394';
    const message = 'مرحباً، أريد الاستفسار عن المنتجات';

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="تواصل عبر واتساب"
        >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
        </a>
    );
}