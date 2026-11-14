// app/link/components/BioLinkCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BioLink } from '@/types';
import BioIcon from './BioIcon';
import { ChevronLeft, Sparkles, ExternalLink } from 'lucide-react';

interface BioLinkCardProps {
  link: BioLink;
  buttonStyle?: string;
}

export default function BioLinkCard({ link, buttonStyle = 'glass-dark' }: BioLinkCardProps) {
  const handleClick = () => {
    // تسجيل النقرة في الخلفية دون تأخير المستخدم
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/bio',
          new Blob([JSON.stringify({ linkId: link.$id })], { type: 'application/json' })
        );
      } else {
        fetch('/api/bio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId: link.$id }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  // تنسيق أنماط الأزرار
  let styleClasses = 'bg-zinc-900/80 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-zinc-800/90 shadow-lg';
  if (buttonStyle === 'solid-dark') {
    styleClasses = 'bg-[#18181b] border border-zinc-800 hover:border-zinc-700 hover:bg-[#27272a] shadow-md';
  } else if (buttonStyle === 'glass-purple') {
    styleClasses = 'bg-purple-950/40 backdrop-blur-md border border-purple-500/25 hover:border-purple-400/60 hover:bg-purple-900/50 shadow-lg';
  } else if (buttonStyle === 'outline') {
    styleClasses = 'bg-transparent border-2 border-white/20 hover:border-white/60 hover:bg-white/10';
  }

  const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');

  return (
    <div className="relative group w-full">
      {/* شارة التمييز للروابط البارزة */}
      {link.isHighlighted && (
        <div className="absolute -top-2.5 right-6 z-10">
          <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            <Sparkles className="w-2.5 h-2.5" />
            <span>مميز</span>
          </span>
        </div>
      )}

      <a
        href={link.url}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer text-right group-hover:scale-[1.015] active:scale-[0.985] ${styleClasses} ${
          link.isHighlighted ? 'ring-2 ring-purple-500/60 shadow-purple-500/15 shadow-xl' : ''
        }`}
      >
        {/* الجزء الأيمن: الأيقونة + النصوص */}
        <div className="flex items-center gap-3.5 min-w-0 pr-1">
          <BioIcon
            icon={link.icon}
            iconImageFileId={link.iconImageFileId}
            className="w-11 h-11 sm:w-12 sm:h-12 text-sm"
          />

          <div className="min-w-0 text-right space-y-0.5">
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-purple-300 transition truncate">
              {link.title}
            </h3>
            {link.subtitle && (
              <p className="text-[11px] sm:text-xs text-zinc-400 group-hover:text-zinc-300 transition truncate">
                {link.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* الجزء الأيسر: سهم الانتقال */}
        <div className="pl-1 text-zinc-500 group-hover:text-white group-hover:-translate-x-1 transition duration-200 shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </div>
      </a>
    </div>
  );
}
