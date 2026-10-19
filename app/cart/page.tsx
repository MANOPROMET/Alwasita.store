'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MessageCircle, ShieldCheck, ChevronLeft, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalCount } = useCart();
    const { formatPrice, convertPrice, currency } = useCurrency();

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // استرجاع بيانات العميل المحفوظة مسبقاً لتسريع إتمام الطلب
    React.useEffect(() => {
        try {
            const data = localStorage.getItem('wasita_customer_info');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.name) setCustomerName(parsed.name);
                if (parsed.phone) setCustomerPhone(parsed.phone);
                if (parsed.city) setCity(parsed.city);
                if (parsed.address) setAddress(parsed.address);
            }
        } catch (e) {
            console.error('Failed to load saved profile for cart', e);
        }
    }, []);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!customerName.trim() || !customerPhone.trim()) {
            setErrorMessage('يرجى إدخال الاسم الكريم ورقم الهاتف/الواتساب للمتابعة');
            return;
        }

        setIsSubmitting(true);

        try {
            // حفظ بيانات العميل في المتصفح لتسهيل المرات القادمة
            try {
                localStorage.setItem('wasita_customer_info', JSON.stringify({
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    city: city.trim(),
                    address: address.trim(),
                }));
            } catch (e) {}

            const fullAddress = [city, address].filter(Boolean).join(' - ');

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                    customerAddress: fullAddress,
                    notes: notes.trim(),
                    items,
                    totalPrice,
                    currency,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'حدث خطأ أثناء حفظ الطلب');
            }

            // تفريغ السلة بعد نجاح حفظ الطلب
            clearCart();

            // حفظ تفاصيل الطلب في المتصفح لمتابعته فورياً في صفحة حسابي
            try {
                localStorage.setItem('wasita_last_order', JSON.stringify({
                    orderId: data.orderId,
                    phone: customerPhone.trim(),
                    total: totalPrice,
                    status: 'pending',
                    time: new Date().toISOString()
                }));
            } catch (e) {}

            // توجيه العميل مباشرة إلى محادثة واتساب
            window.location.href = data.whatsappUrl;
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'تعذر إتمام الطلب، يرجى المحاولة مرة أخرى';
            setErrorMessage(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 1. حالة السلة الفارغة
    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 py-16 bg-gray-50/70">
                <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-2xs space-y-5">
                    <div className="w-20 h-20 bg-purple-50 text-[var(--color-primary)] rounded-3xl flex items-center justify-center mx-auto border border-purple-100">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">سلة المشتريات فارغة</h2>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            لم تقم بإضافة أي منتج إلى سلتك حتى الآن. تفضل بتصفح تشكيلة الأجهزة والملحقات المميزة.
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl transition text-sm shadow-sm"
                    >
                        <span>تصفح المنتجات الآن</span>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/70 pb-20">
            
            {/* 2. مسار التصفح (Breadcrumb) */}
            <div className="bg-white border-b border-gray-200/80 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Link href="/" className="hover:text-[var(--color-primary)] transition">
                            الرئيسية
                        </Link>
                        <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-900 font-bold">سلة التسوق</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                
                {/* رأس صفحة السلة */}
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            سلة المشتريات
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[var(--color-primary)] border border-purple-100">
                            {totalCount} {totalCount === 1 ? 'عنصر' : 'عناصر'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>تفريغ السلة</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                    
                    {/* 3. العمود الأيمن: قائمة منتجات السلة */}
                    <div className="lg:col-span-2 space-y-3.5">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex gap-3 sm:gap-4 items-center shadow-2xs hover:border-[var(--color-primary-soft)] transition"
                            >
                                {/* صورة المنتج */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100">
                                    <Image
                                        src={item.image || '/window.svg'}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>

                                {/* تفاصيل المنتج */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base line-clamp-1">
                                        {item.name}
                                    </h3>
                                    
                                    {(item.variantName || item.colorName) && (
                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                                            {item.variantName && (
                                                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                                    {item.variantName}
                                                </span>
                                            )}
                                            {item.colorName && (
                                                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                                    {item.colorName}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-[var(--color-primary)] font-black text-sm sm:text-base pt-0.5">
                                        {formatPrice(item.price)}
                                    </div>
                                </div>

                                {/* أزرار التحكم بالكمية */}
                                <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50/90 p-1 rounded-xl border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-rose-600 hover:bg-white rounded-lg transition"
                                        aria-label="إنقاص الكمية"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <span className="w-6 sm:w-7 text-center font-bold text-xs sm:text-sm text-gray-800">
                                        {item.quantity}
                                    </span>
                                    
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-[var(--color-primary)] hover:bg-white rounded-lg transition"
                                        aria-label="زيادة الكمية"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* زر حذف العنصر */}
                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
                                    title="حذف من السلة"
                                    aria-label="حذف من السلة"
                                >
                                    <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                </button>
                            </div>
                        ))}

                        <div className="pt-2">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-primary)] hover:underline"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة المزيد من المنتجات</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4. العمود الأيسر: ملخص الطلب ونموذج إتمام الشراء */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24">
                        <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
                            
                            <div className="border-b border-gray-100 pb-3">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                    تفاصيل المستلم والطلب
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    سيتم إرسال تفاصيل الفاتورة مباشرة للمتجر عبر واتساب
                                </p>
                            </div>

                            {/* رسالة الخطأ إن وُجدت */}
                            {errorMessage && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <form onSubmit={handleCheckout} className="space-y-3.5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        الاسم الكامل <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="مثال: محمد عبدالله"
                                        className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        رقم الهاتف / الواتساب <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="مثال: 771234567"
                                        className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">
                                            المدينة / المحافظة
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="مثال: سيئون"
                                            className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">
                                            العنوان التفصيلي
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="الشارع أو المعلم"
                                            className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        ملاحظات خاصة بالطلب (اختياري)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                        placeholder="توقيت التوصيل المفضل أو أي استفسار إضافي..."
                                        className="w-full px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition resize-none"
                                    />
                                </div>

                                {/* ملخص الحساب */}
                                <div className="pt-3 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>قيمة المنتجات:</span>
                                        <span className="font-bold text-gray-700">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>الشحن والتوصيل:</span>
                                        <span className="font-semibold text-emerald-600">يُحدد عند تأكيد الطلب</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-sm font-extrabold text-gray-900">الإجمالي النهائي:</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl sm:text-2xl font-black text-[var(--color-primary)]">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 text-sm cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{isSubmitting ? 'جاري تسجيل الطلب...' : 'تأكيد وإرسال الطلب عبر واتساب'}</span>
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>تسوق آمن ومضمون 100% عبر متجر الواسطة</span>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}