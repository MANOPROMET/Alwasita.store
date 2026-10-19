// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalCount: number;
    totalPrice: number;
    isCartPulsing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCartPulsing, setIsCartPulsing] = useState(false);

    const triggerCartPulse = () => {
        setIsCartPulsing(true);
        setTimeout(() => {
            setIsCartPulsing(false);
        }, 900);
    };

    // استرجاع السلة من localStorage عند الفتح
    useEffect(() => {
        try {
            const saved = localStorage.getItem('wasita_cart');
            if (saved) {
                setItems(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load cart from localStorage', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // حفظ التعديلات في localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('wasita_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (newItem: CartItem) => {
        triggerCartPulse();
        setItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.id === newItem.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += newItem.quantity;
                return updated;
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalCount,
                totalPrice,
                isCartPulsing,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}