// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { getStoreSettings } from '@/lib/appwrite/api';
import { ID } from 'node-appwrite';
import { CartItem } from '@/types';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerName, customerPhone, customerAddress, notes, items, totalPrice, currency: clientCurrency } = body as {
            customerName: string;
            customerPhone: string;
            customerAddress?: string;
            notes?: string;
            items: CartItem[];
            totalPrice: number;
            currency?: string;
        };

        if (!customerName || !customerPhone || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'بيانات الطلب غير مكتملة' },
                { status: 400 }
            );
        }

        // 1. جلب إعدادات المتجر للحصول على العملة ورقم الواتساب
        const settings = await getStoreSettings();
        const currency = clientCurrency || settings?.defaultCurrency || 'SAR';
        const storeWhatsapp = settings?.whatsappNumber || '967770000000';

        // 2. إنشاء الطلب الأساسي في جدول orders
        const order = await databases.createDocument(
            DATABASE_ID,
            'orders',
            ID.unique(),
            {
                customerName,
                customerPhone,
                customerAddress: customerAddress || '',
                notes: notes || '',
                totalAmount: totalPrice,
                currency,
                status: 'pending',
                whatsappSent: true,
                source: 'web',
            }
        );

        // 3. إنشاء عناصر الطلب في جدول order_items مع تحديد نوع item: CartItem صراحة
        await Promise.all(
            items.map((item: CartItem) =>
                databases.createDocument(
                    DATABASE_ID,
                    'order_items',
                    ID.unique(),
                    {
                        order: order.$id,
                        product: item.productId,
                        productName: item.name,
                        variantName: item.variantName || '',
                        colorName: item.colorName || '',
                        productPrice: item.price,
                        quantity: item.quantity,
                        subtotal: item.price * item.quantity,
                    }
                )
            )
        );

        // صياغة نص رسالة الواتساب بدون رموز تسبب علامات استفهام
    let message = `*طلب جديد من متجر الواسطة*\n`;
    message += `------------------------\n`;
    message += `*رقم الطلب:* #${order.$id.slice(-6)}\n\n`;
    message += `*الاسم:* ${customerName}\n`;
    message += `*الهاتف:* ${customerPhone}\n`;
    if (customerAddress) message += `*العنوان:* ${customerAddress}\n`;
    if (notes) message += `*ملاحظات:* ${notes}\n`;

    const currencySymbol = currency === 'SAR' ? 'ر.س' : currency === 'YER' ? 'ر.ي' : '$';

    message += `\n*تفاصيل المنتجات:*\n`;
    items.forEach((item: CartItem, index: number) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.variantName) message += `   • النسخة: ${item.variantName}\n`;
      if (item.colorName) message += `   • اللون: ${item.colorName}\n`;
      message += `   • الكمية: ${item.quantity}\n`;
      message += `   • السعر: ${item.price.toLocaleString()} ${currencySymbol}\n`;
      message += `   • الإجمالي: ${(item.price * item.quantity).toLocaleString()} ${currencySymbol}\n\n`;
    });

    message += `------------------------\n`;
    message += `*الإجمالي النهائي:* ${totalPrice.toLocaleString()} ${currencySymbol}\n`;

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
