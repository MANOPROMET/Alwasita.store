'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES, CurrencyCode } from '@/context/CurrencyContext';
import { ChevronDown, Check } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر في أي مكان آخر
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = CURRENCIES[currency];

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* الزر الرئيسي في الشريط العلوي */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/70 text-gray-800 transition shadow-2xs font-bold text-xs cursor-pointer group"
        title="تغيير عملة عرض الأسعار"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base leading-none">{active.flag}</span>
        <span className="font-extrabold text-primary-700">{active.symbol}</span>
        <span className="hidden md:inline text-[11px] font-medium text-gray-600">
          ({active.code})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-primary-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* القائمة المنسدلة للعملات */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in divide-y divide-gray-50">
          <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            اختر عملة العرض
          </div>

          <div className="py-1">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = CURRENCIES[code];
              const isSelected = currency === code;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/80 text-primary-700 font-black'
                      : 'text-gray-700 hover:bg-gray-50 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="text-right">
                      <span className="block leading-tight">{item.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.symbol} ({item.code})
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-primary-600 stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
