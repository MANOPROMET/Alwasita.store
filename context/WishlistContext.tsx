'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  wishlistCount: number;
  isWishlistPulsing: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'wasita_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWishlistPulsing, setIsWishlistPulsing] = useState(false);

  const triggerWishlistPulse = () => {
    setIsWishlistPulsing(true);
    setTimeout(() => {
      setIsWishlistPulsing(false);
    }, 900);
  };

  // تحميل المفضلة من التخزين المحلي عند بدء التطبيق
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load wishlist from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // حفظ التغييرات في التخزين المحلي
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to save wishlist to localStorage:', err);
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.$id === productId);
  };

  const addToWishlist = (product: Product) => {
    triggerWishlistPulse();
    setWishlist((prev) => {
      if (prev.some((p) => p.$id === product.$id)) return prev;
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId: string) => {
    triggerWishlistPulse();
    setWishlist((prev) => prev.filter((p) => p.$id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    triggerWishlistPulse();
    if (isInWishlist(product.$id)) {
      setWishlist((prev) => prev.filter((p) => p.$id !== product.$id));
    } else {
      setWishlist((prev) => [product, ...prev]);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
        isWishlistPulsing,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
