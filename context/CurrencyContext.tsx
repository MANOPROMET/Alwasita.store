'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'SAR' | 'YER' | 'USD';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  SAR: { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
  YER: { code: 'YER', name: 'ريال يمني', symbol: 'ر.ي', flag: '🇾🇪' },
  USD: { code: 'USD', name: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
};

export interface ExchangeRates {
  yer: number; // قيمة الريال السعودي باليمني (افتراضي 412)
  usd: number; // قيمة الدولار الواحد بالسعودي (افتراضي 3.82)
}

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyInfo: CurrencyInfo;
  rates: ExchangeRates;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceInSar: number | undefined | null) => string;
  convertPrice: (priceInSar: number | undefined | null) => {
    amount: number;
    formatted: string;
    symbol: string;
    code: CurrencyCode;
  };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('SAR');
  const [rates, setRates] = useState<ExchangeRates>({
    yer: 412,
    usd: 3.82,
  });

  // استرجاع تفضيل العملة من التخزين المحلي وجلب أحدث أسعار الصرف
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wasita_store_currency') as CurrencyCode;
      if (saved && (saved === 'SAR' || saved === 'YER' || saved === 'USD')) {
        setCurrencyState(saved);
      }
    }

    // جلب أسعار الصرف الحية من إعدادات المتجر
    async function loadRates() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setRates({
            yer: Number(data.settings.exchangeRateYer) || 412,
            usd: Number(data.settings.exchangeRateUsd) || 3.82,
          });
        }
      } catch (err) {
        console.error('Failed to load currency rates:', err);
      }
    }

    loadRates();
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wasita_store_currency', c);
    }
  };

  // تحويل السعر مع أرقام دقيقة
  const convertPrice = (priceInSar: number | undefined | null) => {
    const base = Number(priceInSar) || 0;
    const info = CURRENCIES[currency];

    let amount = base;
    if (currency === 'YER') {
      amount = Math.round(base * rates.yer);
    } else if (currency === 'USD') {
      amount = Number((base / rates.usd).toFixed(2));
    } else {
      amount = Math.round(base);
    }

    const formatted =
      currency === 'USD'
        ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : amount.toLocaleString('ar-YE');

    return {
      amount,
      formatted,
      symbol: info.symbol,
      code: currency,
    };
  };

  // تنسيق السعر كنص جاهز للعرض مباشرة
  const formatPrice = (priceInSar: number | undefined | null) => {
    const { formatted, symbol, code } = convertPrice(priceInSar);
    if (code === 'USD') {
      return `$${formatted}`;
    }
    return `${formatted} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo: CURRENCIES[currency],
        rates,
        setCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
