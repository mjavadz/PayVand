import React, { useState, useRef } from 'react';

/**
 * InteractiveBanner - Mouse-following spotlight pill banner with Vazirmatn typography
 */
export function InteractiveBanner({ className = '' }) {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="text-center select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: -100, y: -100 });
        }}
        className={`group relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121620]/95 border border-white/[0.08] text-xs font-sans shadow-lg transition-all duration-300 overflow-hidden cursor-default hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] ${className}`}
      >
        {/* Dynamic Mouse Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(110px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.35), rgba(6, 182, 212, 0.18) 40%, transparent 80%)`,
          }}
        />

        {/* Ambient Subtle Specular Sheen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(90px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.12), transparent 70%)`,
          }}
        />

        {/* Glowing Emerald Pulse Beacon */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-[0_0_8px_#10b981]" />
        </span>

        {/* Text in Vazirmatn Font */}
        <div className="relative z-10 flex items-center gap-2 text-[11px] sm:text-xs font-sans">
          <span className="font-extrabold text-white tracking-tight font-sans">PayVand</span>
          <span className="text-white/25 font-light">•</span>
          <span className="font-sans font-medium text-emerald-300/90 group-hover:text-emerald-200 transition-colors">
            پروتکل پی‌وند؛ مبادله غیرحضانتی چندزنجیره‌ای
          </span>
        </div>
      </div>
    </div>
  );
}

export default InteractiveBanner;
