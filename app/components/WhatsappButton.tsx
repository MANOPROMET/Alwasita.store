// app/components/WhatsappButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsappButton() {
    const pathname = usePathname();
    const [phoneNumber, setPhoneNumber] = useState('967771211394');

    useEffect(() => {
        let isMounted = true;
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && data.settings?.whatsappNumber) {
                    setPhoneNumber(data.settings.whatsappNumber.replace(/[^\d]/g, ''));
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const message = 'مرحباً، أريد الاستفسار عن المنتجات في متجر الواسطة';

    return (
        <a
            href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="تواصل عبر واتساب"
        >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition" />
        </a>
    );
}