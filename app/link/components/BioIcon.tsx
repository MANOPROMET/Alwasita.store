// app/link/components/BioIcon.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/appwrite/utils';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaTelegram,
  FaXTwitter,
  FaYoutube,
  FaSnapchat,
} from 'react-icons/fa6';
import {
  ShoppingBag,
  Sparkles,
  Phone,
  MapPin,
  Globe,
  Truck,
  Star,
  Mail,
  ExternalLink,
  MessageCircle,
  FileText,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Gift,
} from 'lucide-react';

interface BioIconProps {
  icon?: string;
  iconImageFileId?: string;
  className?: string;
}

export function getIconConfig(icon?: string) {
  const normalized = (icon || '').toLowerCase().trim();

  switch (normalized) {
    case 'whatsapp':
      return {
        Component: FaWhatsapp,
        bgGradient: 'bg-emerald-500',
        textColor: 'text-white',
        label: 'واتساب',
      };
    case 'instagram':
      return {
        Component: FaInstagram,
        bgGradient: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
        textColor: 'text-white',
        label: 'إنستغرام',
      };
    case 'facebook':
      return {
        Component: FaFacebookF,
        bgGradient: 'bg-blue-600',
        textColor: 'text-white',
        label: 'فيسبوك',
      };
    case 'tiktok':
      return {
        Component: FaTiktok,
        bgGradient: 'bg-black border border-white/20',
        textColor: 'text-white',
        label: 'تيك توك',
      };
    case 'telegram':
      return {
        Component: FaTelegram,
        bgGradient: 'bg-sky-500',
        textColor: 'text-white',
        label: 'تيليجرام',
      };
    case 'twitter':
    case 'x':
      return {
        Component: FaXTwitter,
        bgGradient: 'bg-black border border-white/20',
        textColor: 'text-white',
        label: 'منصة إكس',
      };
    case 'youtube':
      return {
        Component: FaYoutube,
        bgGradient: 'bg-red-600',
        textColor: 'text-white',
        label: 'يوتيوب',
      };
    case 'snapchat':
      return {
        Component: FaSnapchat,
        bgGradient: 'bg-yellow-400',
        textColor: 'text-black',
        label: 'سناب شات',
      };
    case 'shopping-bag':
    case 'store':
      return {
        Component: ShoppingBag,
        bgGradient: 'bg-gradient-to-br from-purple-600 to-indigo-700',
        textColor: 'text-white',
        label: 'المتجر',
      };
    case 'sparkles':
    case 'offers':
      return {
        Component: Sparkles,
        bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
        textColor: 'text-white',
        label: 'العروض',
      };
    case 'phone':
      return {
        Component: Phone,
        bgGradient: 'bg-emerald-600',
        textColor: 'text-white',
        label: 'هاتف',
      };
    case 'message-circle':
      return {
        Component: MessageCircle,
        bgGradient: 'bg-emerald-500',
        textColor: 'text-white',
        label: 'محادثة',
      };
    case 'map-pin':
    case 'location':
      return {
        Component: MapPin,
        bgGradient: 'bg-rose-600',
        textColor: 'text-white',
        label: 'الموقع',
      };
    case 'globe':
      return {
        Component: Globe,
        bgGradient: 'bg-cyan-600',
        textColor: 'text-white',
        label: 'موقع ويب',
      };
    case 'truck':
      return {
        Component: Truck,
        bgGradient: 'bg-amber-600',
        textColor: 'text-white',
        label: 'الشحن والتوصيل',
      };
    case 'star':
      return {
        Component: Star,
        bgGradient: 'bg-yellow-500',
        textColor: 'text-white',
        label: 'مميز',
      };
    case 'mail':
    case 'email':
      return {
        Component: Mail,
        bgGradient: 'bg-indigo-600',
        textColor: 'text-white',
        label: 'بريد',
      };
    case 'file-text':
      return {
        Component: FileText,
        bgGradient: 'bg-slate-700',
        textColor: 'text-white',
        label: 'مستند',
      };
    case 'credit-card':
      return {
        Component: CreditCard,
        bgGradient: 'bg-teal-600',
        textColor: 'text-white',
        label: 'دفع',
      };
    case 'gift':
      return {
        Component: Gift,
        bgGradient: 'bg-pink-600',
        textColor: 'text-white',
        label: 'هدية',
      };
    default:
      return {
        Component: ExternalLink,
        bgGradient: 'bg-zinc-800 border border-white/10',
        textColor: 'text-zinc-300',
        label: 'رابط',
      };
  }
}

export default function BioIcon({ icon, iconImageFileId, className = 'w-11 h-11' }: BioIconProps) {
  // إذا تم رفع صورة مخصصة
  if (iconImageFileId) {
    const imageUrl = getProductImageUrl(iconImageFileId);
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 border border-white/20 bg-white/10 ${className}`}>
        <Image src={imageUrl} alt="أيقونة" fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  const { Component, bgGradient, textColor } = getIconConfig(icon);

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 shadow-sm ${bgGradient} ${textColor} ${className}`}
    >
      <Component className="w-5 h-5" />
    </div>
  );
}
