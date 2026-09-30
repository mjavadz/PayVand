import React from 'react';

export default function Footer({ onSwitchTab }) {
  const links = [
    { label: 'سواپ غیرحضانتی', tab: 'swap' },
    { label: 'استارز تلگرام', tab: 'stars' },
    { label: 'ابزارهای ایران', tab: 'iran' },
    { label: 'پیگیری سفارشات', tab: 'orders' },
  ];

  return (
    <footer className="w-full border-t border-border/40 py-8 pb-20 md:pb-10 mt-auto">
      <div className="max-w-3xl mx-auto px-4 space-y-5">
        
        {/* Navigation Links — Minimalist Pill Row */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
          {links.map((link) => (
            <button
              key={link.tab}
              type="button"
              onClick={() => onSwitchTab(link.tab)}
              className="hover:text-foreground transition-colors font-medium hover:underline underline-offset-4"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Bottom Minimal Info Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted-foreground/70 border-t border-border/30 pt-4 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground/90">JSWAP</span>
            <span>•</span>
            <span>پروتکل مبادله غیرحضانتی و امن چندزنجیره‌ای</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>تسویه مستقیم روی استخرهای غیرمتمرکز</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <img src="/logo.svg" alt="JSWAP" className="w-3.5 h-3.5 object-contain" />
              <span className="font-sans font-bold text-foreground">JSWAP</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
