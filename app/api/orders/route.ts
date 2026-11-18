// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { getStoreSettings } from '@/lib/appwrite/api';
import { ID } from 'node-appwrite';
import { CartItem } from '@/types';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);

        // 1. فحص معدل إرسال الطلبات لمنع السبام وإغراق قاعدة البيانات (DDoS / Spam Protection): 5 طلبات لكل 5 دقائق
        const rateCheck = checkRateLimit(`create-order:${clientIp}`, 5, 5 * 60 * 1000);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'تم إرسال عدد كبير من الطلبات. يرجى الانتظار بضع دقائق قبل إرسال طلب جديد.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const {
            customerName,
            customerPhone,
            customerAddress,
            notes,
            items,
            totalPrice,
            currency: clientCurrency,
        } = body as {
            customerName: string;
            customerPhone: string;
            customerAddress?: string;
            notes?: string;
            items: CartItem[];
            totalPrice: number;
            currency?: string;
        };

        // 2. التحقق الصارم من الحقول الأساسية وصحتها
        if (
            !customerName ||
            typeof customerName !== 'string' ||
            customerName.trim().length < 2 ||
            customerName.trim().length > 100
        ) {
            return NextResponse.json(
                { error: 'يرجى إدخال اسم عميل صحيح (بين 2 و 100 حرف)' },
                { status: 400 }
            );
        }

        const cleanPhone = (customerPhone || '').replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 20) {
            return NextResponse.json(
                { error: 'يرجى إدخال رقم هاتف صالح للتواصل' },
                { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
            return NextResponse.json(
                { error: 'قائمة منتجات الطلب غير صحيحة أو تتجاوز الحد المسموح' },
                { status: 400 }
            );
        }

        // فحص توافر المخزون ومنع إتمام الطلب نهائياً إذا كانت كمية أي منتج قد نفدت
        const productIds = Array.from(new Set(items.map((i) => i.productId).filter(Boolean)));
        if (productIds.length > 0) {
            const productDocs = await Promise.all(
                productIds.map(async (pid) => {
                    try {
                        return await databases.getDocument(DATABASE_ID, 'products', pid);
                    } catch {
                        return null;
                    }
                })
            );
            for (const doc of productDocs) {
                if (doc && doc.isOutOfStock) {
                    return NextResponse.json(
                        { error: `عذراً، لقد نفدت كمية المنتج (${doc.name}) حالياً ولم يعد متاحاً للطلب.` },
                        { status: 400 }
                    );
                }
            }
        }

        const parsedTotal = Number(totalPrice);
        if (isNaN(parsedTotal) || parsedTotal <= 0 || !isFinite(parsedTotal)) {
            return NextResponse.json(
                { error: 'إجمالي مبلغ الطلب غير صالح' },
                { status: 400 }
            );
        }

        // تنظيف النصوص وتحديد أطوالها لمنع هجمات Payload Bloat
        const safeName = customerName.trim().slice(0, 100);
        const safePhone = customerPhone.trim().slice(0, 30);
        const safeAddress = (customerAddress || '').trim().slice(0, 300);
        const safeNotes = (notes || '').trim().slice(0, 500);

        // 3. جلب إعدادات المتجر للحصول على العملة ورقم الواتساب
        const settings = await getStoreSettings();
        const currency = clientCurrency === 'YER' || clientCurrency === 'SAR' || clientCurrency === 'USD'
            ? clientCurrency
            : (settings?.defaultCurrency || 'SAR');
        const storeWhatsapp = settings?.whatsappNumber || '967770000000';

        // 4. إنشاء الطلب الأساسي في جدول orders
        const order = await databases.createDocument(
            DATABASE_ID,
            'orders',
            ID.unique(),
            {
                customerName: safeName,
                customerPhone: safePhone,
                customerAddress: safeAddress,
                notes: safeNotes,
                totalAmount: parsedTotal,
                currency,
                status: 'pending',
                whatsappSent: true,
                source: 'web',
            }
        );

        // 5. إنشاء عناصر الطلب في جدول order_items مع التحقق من قيم كل عنصر
        await Promise.all(
            items.map((item: CartItem) => {
                const itemPrice = Math.max(0, Number(item.price) || 0);
                const itemQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
                return databases.createDocument(
                    DATABASE_ID,
                    'order_items',
                    ID.unique(),
                    {
                        order: order.$id,
                        product: String(item.productId || '').slice(0, 64),
                        productName: String(item.name || '').slice(0, 150),
                        variantName: String(item.variantName || '').slice(0, 100),
                        colorName: String(item.colorName || '').slice(0, 50),
                        productPrice: itemPrice,
                        quantity: itemQty,
                        subtotal: itemPrice * itemQty,
                    }
                );
            })
        );

        // صياغة نص رسالة الواتساب
        let message = `*طلب جديد من متجر الواسطة*\n`;
        message += `------------------------\n`;
        message += `*رقم الطلب:* #${order.$id.slice(-6)}\n\n`;
        message += `*الاسم:* ${safeName}\n`;
        message += `*الهاتف:* ${safePhone}\n`;
        if (safeAddress) message += `*العنوان:* ${safeAddress}\n`;
        if (safeNotes) message += `*ملاحظات:* ${safeNotes}\n`;

        const currencySymbol = currency === 'SAR' ? 'ر.س' : currency === 'YER' ? 'ر.ي' : '$';

        message += `\n*تفاصيل المنتجات:*\n`;
        items.forEach((item: CartItem, index: number) => {
            const itemPrice = Math.max(0, Number(item.price) || 0);
            const itemQty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
            message += `${index + 1}. *${String(item.name || '').slice(0, 100)}*\n`;
            if (item.variantName) message += `   • النسخة: ${String(item.variantName).slice(0, 50)}\n`;
            if (item.colorName) message += `   • اللون: ${String(item.colorName).slice(0, 50)}\n`;
            message += `   • الكمية: ${itemQty}\n`;
            message += `   • السعر: ${itemPrice.toLocaleString()} ${currencySymbol}\n`;
            message += `   • الإجمالي: ${(itemPrice * itemQty).toLocaleString()} ${currencySymbol}\n\n`;
        });

        message += `------------------------\n`;
        message += `*الإجمالي النهائي:* ${parsedTotal.toLocaleString()} ${currencySymbol}\n`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeWhatsapp}&text=${encodeURIComponent(message)}`;

        return NextResponse.json({
            success: true,
            orderId: order.$id,
            whatsappUrl,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'فشل في تسجيل الطلب، يرجى المحاولة لاحقاً' },
            { status: 500 }
        );
    }
}
