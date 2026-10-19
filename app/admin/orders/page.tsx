'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  Trash2,
  Loader2,
  Calendar,
  ChevronDown,
  Package,
} from 'lucide-react';

interface OrderItem {
  $id: string;
  productName: string;
  variantName?: string;
  colorName?: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  $id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  $createdAt: string;
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchOrders = async (statusFilter?: string) => {
    try {
      setLoading(true);
      const url =
        statusFilter && statusFilter !== 'all'
          ? `/api/admin/orders?status=${statusFilter}`
          : '/api/admin/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedOrderIds([]);
    fetchOrders(activeStatus);
  }, [activeStatus]);

  // تحديث حالة الطلب
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.$id === orderId ? { ...o, status: newStatus as any } : o))
        );
      } else {
        alert(data.error || 'فشل تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  // حذف طلب فردي
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.$id !== orderId));
        setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // حذف جماعي للطلبات المحددة
  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    if (
      !confirm(
        `هل أنت متأكد من حذف ${selectedOrderIds.length} طلبات محددة نهائياً؟ سيتم مسح تفاصيل المنتجات المرتبطة بها ولا يمكن التراجع.`
      )
    ) {
      return;
    }

    try {
      setBulkDeleting(true);
      const res = await fetch(`/api/admin/orders?ids=${selectedOrderIds.join(',')}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => !selectedOrderIds.includes(o.$id)));
        setSelectedOrderIds([]);
      } else {
        alert(data.error || 'فشل حذف الطلبات المحددة');
      }
    } catch (err: any) {
      console.error('Error in bulk delete:', err);
      alert('حدث خطأ أثناء حذف الطلبات المحددة');
    } finally {
      setBulkDeleting(false);
    }
  };

  const getOrderCurrencySymbol = (currency?: string) => {
    if (currency === 'SAR' || currency === 'ر.س') return 'ر.س';
    if (currency === 'YER' || currency === 'ر.ي') return 'ر.ي';
    if (currency === 'USD' || currency === '$') return '$';
    return currency || 'ر.س';
  };

  // فتح محادثة واتساب ذكية مع العميل حسب حالة طلبه
  const openWhatsApp = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^\d]/g, '');
    const phoneWithCode = cleanPhone.startsWith('967')
      ? cleanPhone
      : `967${cleanPhone.replace(/^0+/, '')}`;
    const currSym = getOrderCurrencySymbol(order.currency);
    const shortNum = order.$id.slice(-6);

    let messageText = '';
    switch (order.status) {
      case 'confirmed':
        messageText = `مرحباً بك أخي ${order.customerName}،\nيسعدنا إبلاغك بأنه *تمت الموافقة وتأكيد طلبك* رقم (#${shortNum}) بنجاح من إدارة متجر الواسطة.\nإجمالي المبلغ: ${order.totalAmount} ${currSym}.\nجاري التجهيز لبدء الشحن إلى عنوانك (${order.customerAddress || 'المحدد'}).`;
        break;
      case 'shipped':
        messageText = `مرحباً بك أخي ${order.customerName}،\nطلبك رقم (#${shortNum}) *في الطريق إليك الآن* 🚚\nالعنوان: ${order.customerAddress || 'المحدد'}.\nإجمالي المبلغ المطلوب عند الاستلام: ${order.totalAmount} ${currSym}.`;
        break;
      case 'delivered':
        messageText = `مرحباً بك أخي ${order.customerName}،\nنبارك لك استلام طلبك رقم (#${shortNum}) بنجاح 🎉\nنشكرك على ثقتك بمتجر الواسطة ونسعد دائماً بخدمتك!`;
        break;
      case 'cancelled':
        messageText = `مرحباً أخي ${order.customerName}،\nنتواصل معك بخصوص طلبك رقم (#${shortNum}) والذي تم تسجيله كـ *ملغي*.\nإذا كان لديك أي استفسار أو ترغب في إعادة الطلب نحن بالخدمة دائماً.`;
        break;
      case 'pending':
      default:
        messageText = `مرحباً بك أخي ${order.customerName}،\nنتواصل معك من إدارة متجر الواسطة لتأكيد طلبك المسجل رقم (#${shortNum}).\nإجمالي المبلغ: ${order.totalAmount} ${currSym}.\nهل العنوان (${order.customerAddress || 'المسجل'}) جاهز للاستلام والتأكيد؟`;
        break;
    }

    const message = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank');
  };

  // تصفية حسب البحث
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.includes(q) ||
      o.$id?.toLowerCase().includes(q)
    );
  });

  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.includes(o.$id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.$id));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم التأكيد
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <Truck className="w-3.5 h-3.5" />
            جاري الشحن والتوصيل
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم التسليم بنجاح
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
            <AlertCircle className="w-3.5 h-3.5" />
            ملغي
          </span>
        );
      default:
        return (
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>لوحة التحكم الرئيسية</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">إدارة طلبات الشراء</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            متابعة وإدارة كافة الطلبات الواردة من العملاء عبر سلة المشتريات.
          </p>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs space-y-4">
        
        {/* بحث بالاسم أو الهاتف */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم هاتفه أو رقم الطلب..."
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* أزرار الحالات */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">الحالة:</span>

          {[
            { id: 'all', label: 'كافة الطلبات' },
            { id: 'pending', label: 'قيد الانتظار' },
            { id: 'confirmed', label: 'مؤكدة' },
            { id: 'shipped', label: 'جاري الشحن' },
            { id: 'delivered', label: 'مكتملة' },
            { id: 'cancelled', label: 'ملغية' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                activeStatus === tab.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* شريط الإجراءات الجماعية وتحديد الكل */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border border-gray-200/90 rounded-2xl shadow-xs">
          <label className="flex items-center gap-2.5 text-xs font-bold text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <span>تحديد الكل في هذا القسم ({filteredOrders.length} طلب)</span>
          </label>

          {selectedOrderIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
              <span className="text-xs font-black text-primary-700 bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-xl">
                تم تحديد {selectedOrderIds.length} من أصل {filteredOrders.length}
              </span>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>حذف الطلبات المحددة ({selectedOrderIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          )}
        </div>
      )}

      {/* قائمة الطلبات */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="text-xs font-bold text-gray-500">جاري جلب الطلبات...</span>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.$id;
            const isSelected = selectedOrderIds.includes(order.$id);
            const dateStr = order.$createdAt
              ? new Date(order.$createdAt).toLocaleDateString('ar-YE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={order.$id}
                className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200/80 hover:border-primary-400'
                }`}
              >
                {/* رأس بطاقة الطلب */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                  
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOrder(order.$id)}
                      className="w-4 h-4 mt-1 rounded text-primary-600 focus:ring-primary-500 cursor-pointer shrink-0"
                    />

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base sm:text-lg font-black text-gray-900">
                          {order.customerName}
                        </h3>
                        {getStatusBadge(order.status)}
                        <span className="text-xs font-mono text-gray-400">
                          #{order.$id.slice(-6)}
                        </span>
                      </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                      {order.customerAddress && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{order.customerAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* إجمالي المبلغ والإجراءات */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 block">إجمالي الطلب</span>
                      <span className="text-lg font-black text-gray-900">
                        {order.currency === 'USD' ? (
                          `$${Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : (
                          <>
                            {Number(order.totalAmount).toLocaleString('ar-SA')}{' '}
                            <span className="text-xs font-bold text-gray-500">
                              {getOrderCurrencySymbol(order.currency)}
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* زر الواتساب المباشر */}
                    <button
                      onClick={() => openWhatsApp(order)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="مراسلة العميل بالواتساب"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>واتساب</span>
                    </button>

                    {/* زر تفاصيل المنتجات */}
                    <button
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.$id)
                      }
                      className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>العناصر ({order.items?.length || 0})</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* زر الحذف */}
                    <button
                      onClick={() => handleDeleteOrder(order.$id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* تغيير الحالة المباشر */}
                <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-gray-500">تحديث حالة الطلب:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { status: 'pending', label: 'قيد الانتظار', color: 'hover:bg-amber-100' },
                      { status: 'confirmed', label: 'تأكيد الطلب', color: 'hover:bg-blue-100' },
                      { status: 'shipped', label: 'بدء الشحن', color: 'hover:bg-purple-100' },
                      { status: 'delivered', label: 'تم التسليم', color: 'hover:bg-emerald-100' },
                      { status: 'cancelled', label: 'إلغاء الطلب', color: 'hover:bg-red-100' },
                    ].map((btn) => (
                      <button
                        key={btn.status}
                        disabled={updatingId === order.$id || order.status === btn.status}
                        onClick={() => handleUpdateStatus(order.$id, btn.status)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer disabled:opacity-40 ${
                          order.status === btn.status
                            ? 'bg-gray-900 text-white shadow-xs'
                            : `bg-white border border-gray-200 text-gray-700 ${btn.color}`
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* المحتوى المنسدل لتفاصيل المنتجات في الطلب */}
                {isExpanded && (
                  <div className="p-6 bg-purple-50/20 border-t border-purple-100 space-y-4">
                    <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-primary-600" />
                      <span>المنتجات المطلوبة في هذا الطلب:</span>
                    </h4>

                    {order.items && order.items.length > 0 ? (
                      <div className="divide-y divide-purple-100/60 bg-white rounded-2xl border border-purple-100 overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div
                            key={item.$id || idx}
                            className="p-4 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-gray-900 text-sm">
                                {item.productName}
                              </span>
                              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                                {item.variantName && <span>السعة: {item.variantName}</span>}
                                {item.colorName && <span>اللون: {item.colorName}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-right">
                              <span className="text-gray-500">
                                {item.quantity} ×{' '}
                                {order.currency === 'USD'
                                  ? `$${Number(item.productPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : `${Number(item.productPrice).toLocaleString('ar-SA')} ${getOrderCurrencySymbol(order.currency)}`}
                              </span>
                              <span className="font-black text-gray-900 text-sm">
                                {order.currency === 'USD'
                                  ? `$${Number(item.subtotal || item.productPrice * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : `${Number(item.subtotal || item.productPrice * item.quantity).toLocaleString('ar-SA')} ${getOrderCurrencySymbol(order.currency)}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
                        لا توجد تفاصيل عناصر مسجلة لهذا الطلب القديم.
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-xs bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800">
                        <span className="font-bold block mb-0.5">ملاحظات العميل:</span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-gray-200/70">
          <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-gray-500">
            {activeStatus !== 'all'
              ? 'لا توجد طلبات بهذه الحالة المحددة.'
              : 'لم يتم استلام أي طلبات شراء من المتجر بعد.'}
          </p>
        </div>
      )}

    </div>
  );
}
