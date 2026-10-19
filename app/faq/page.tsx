// app/faq/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  Search,
  MessageCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  Package,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'orders' | 'payment' | 'shipping' | 'returns' | 'products';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: '1',
    category: 'orders',
    question: 'كيف يمكنني إتمام الطلب من المتجر؟',
    answer:
      'يمكنك تصفح المنتجات واختيار اللون والنسخة المناسبة ثم إضافتها إلى السلة. بعد ذلك توجه إلى صفحة السلة واضغط على "إتمام الطلب"، حيث يتم تحويل بيانات طلبك مباشرة إلى الواتساب للتأكيد السريع مع فريق خدمة العملاء وتزويدك بسند وفاتورة الطلب.',
  },
  {
    id: '2',
    category: 'orders',
    question: 'كيف يمكنني تتبع حالة طلبي بعد إرساله؟',
    answer:
      'يمكنك متابعة حالة طلبك من خلال لوحة التحكم أو بالدخول إلى صفحة "حسابي"، كما يقوم فريق خدمة العملاء بإرسال إشعارات مباشرة عبر الواتساب فور انتقال الطلب إلى (مؤكد) أو (جاري الشحن) مع تزويدك برقم بوليصة الشحن.',
  },
  {
    id: '3',
    category: 'payment',
    question: 'ما هي طرق الدفع المتاحة لدى متجر الواسطة؟',
    answer:
      'نوفر عدة طرق دفع مريحة وآمنة تشمل التحويلات المصرفية المباشرة (مثل حساب بنك الكريمي، شبكة النجم، بنك القطيبي، الحسابات البنكية بالريال السعودي أو اليمني)، بالإضافة إلى الدفع عند الاستلام في المدن والمناطق التي تتوفر فيها الخدمة.',
  },
  {
    id: '4',
    category: 'shipping',
    question: 'كم تستغرق مدة الشحن وكيف يتم احتساب التكلفة؟',
    answer:
      'تتم معالجة الطلبات خلال 24 ساعة، وتستغرق مدة التوصيل بين 1 إلى 3 أيام عمل لمعظم المحافظات. تكلفة الشحن تكون غالباً على العميل بالاتفاق مع شركة النقل، وتكون مجانية في المنتجات والعروض الترويجية المحددة كـ "شحن مجاني".',
  },
  {
    id: '5',
    category: 'returns',
    question: 'ما هي سياسة الإرجاع والاستبدال؟',
    answer:
      'الإرجاع والاستبدال متاح فقط في حالة وجود خلل فني أو مصنعي مثبت في الجهاز، بشرط إشعار المتجر خلال مدة أقصاها يوم واحد فقط (24 ساعة) من وقت استلام الطلب، مع الاحتفاظ بكافة الملحقات والكرتون الأصلي بحالة سليمة.',
  },
  {
    id: '6',
    category: 'products',
    question: 'ما الفرق بين الأجهزة الجديدة والأجهزة المستخدمة في المتجر؟',
    answer:
      'المنتجات المصنفة كـ "جديد" تكون أصلية ومغلفة بكرتون المصنع وضمانه. أما المنتجات المصنفة كـ "مستخدم" (مثل مستخدم أمريكي أو محلي) فهي أجهزة أصلية تم فحصها بدقة فائقة من قبل مهندسينا واختبار البطارية والشاشة والشحن للتأكد من أنها بحالة الوكالة (كرت نظيف) مع توضيح حالتها صراحة على المنتج.',
  },
  {
    id: '7',
    category: 'products',
    question: 'هل الملحقات والشواحن المعروضة أصلية؟',
    answer:
      'نعم بالتأكيد، نحن في متجر الواسطة نحرص على انتقاء المنتجات الأصلية والموثوقة من الشركات العالمية المعتمدة، مع ضمان الأداء والسلامة لكافة بطاريات وأجهزة الشحن والشبكات.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    '1': true,
    '4': true,
    '5': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      
      {/* 1. مسار التصفح (Breadcrumb) */}
      <div className="bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-primary)] transition">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">الأسئلة الشائعة</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* رأس الصفحة مع شارة الأيقونة */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-[var(--color-primary)] shadow-sm">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            الأسئلة الشائعة وإرشادات التسوق
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            إجابات شاملة ومفصلة عن أكثر الاستفسارات تكراراً حول الطلب والشحن والضمان وطرق الدفع.
          </p>
        </div>

        {/* شريط البحث المباشر */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن سؤالك هنا (مثل: الدفع، الشحن، الإرجاع، المستعمل...)"
            className="w-full pl-4 pr-11 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* أزرار الفئات والتبويب */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'جميع الأسئلة' },
            { id: 'orders', label: 'الطلبات والحساب' },
            { id: 'payment', label: 'طرق الدفع' },
            { id: 'shipping', label: 'الشحن والتوصيل' },
            { id: 'returns', label: 'الإرجاع والضمان' },
            { id: 'products', label: 'المنتجات والأجهزة' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* قائمة الأكورديون للأسئلة والأجوبة */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => {
              const isOpen = Boolean(openItems[item.id]);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-[var(--color-primary)] cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
              لم نعثر على أسئلة تطابق بحثك. جرب كتابة كلمة أخرى أو تواصل معنا مباشرة.
            </div>
          )}
        </div>

        {/* المساعدة والتواصل إذا لم يجد العميل إجابته */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-zinc-950 to-zinc-900 text-white rounded-3xl space-y-4 shadow-lg text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">لم تجد إجابة لاستفسارك؟</h3>
            <p className="text-xs text-zinc-300">
              فريق متجر الواسطة جاهز للرد على جميع استفساراتك وخدمتك على مدار الساعة.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shrink-0 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع الدعم الفني</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
