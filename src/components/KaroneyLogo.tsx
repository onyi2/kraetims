import React from 'react';

interface KaroneyLogoProps {
  className?: string;
  size?: number;
}

export const KaroneyLogo: React.FC<KaroneyLogoProps> = ({ 
  className = '', 
  size = 80 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        {/* Dynamic Gradient for Modern Professional Corporate Supplies Brand */}
        <linearGradient id="karoneyBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Royal Blue */}
          <stop offset="100%" stopColor="#1E3A8A" /> {/* Deep Indigo */}
        </linearGradient>
        <linearGradient id="amberGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" /> {/* Amber */}
          <stop offset="100%" stopColor="#D97706" /> {/* Darker Golden */}
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Main Container - Elegant Rounded Soft Hexagon appropriate for a supplies corporation */}
      <path 
        d="M 50,4 L 88,26 L 88,74 L 50,96 L 12,74 L 12,26 Z" 
        fill="url(#karoneyBrandGrad)" 
        stroke="url(#amberGoldGrad)" 
        strokeWidth="3" 
        strokeLinejoin="round"
        filter="url(#softShadow)"
      />

      {/* Inner offset hexagon border for sleek premium feel */}
      <path 
        d="M 50,10 L 82,29 L 82,71 L 50,90 L 18,71 L 18,29 Z" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="1" 
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* Modern Stylized 'K' & Office Supplies Motif */}
      {/* 1. Spine / Left Ledger Book block of Karoney */}
      <g filter="url(#softShadow)">
        <rect x="33" y="26" width="9" height="48" rx="2" fill="#FFFFFF" />
        {/* Binder ridges */}
        <line x1="33" y1="36" x2="42" y2="36" stroke="#1E3A8A" strokeWidth="1.2" opacity="0.3" />
        <line x1="33" y1="46" x2="42" y2="46" stroke="#1E3A8A" strokeWidth="1.2" opacity="0.3" />
        <line x1="33" y1="56" x2="42" y2="56" stroke="#1E3A8A" strokeWidth="1.2" opacity="0.3" />
        <line x1="33" y1="66" x2="42" y2="66" stroke="#1E3A8A" strokeWidth="1.2" opacity="0.3" />
      </g>

      {/* 2. Upper branch of K - forming a stylized high-lighted ruler or paper diagonal */}
      <path 
        d="M 42,46 L 63,26 C 65.5,23.5 69.5,23.5 72,26 C 74.5,28.5 74.5,32.5 72,35 L 53,54 Z" 
        fill="#FFFFFF" 
        opacity="0.95"
        filter="url(#softShadow)"
      />

      {/* 3. Lower branch of K - beautifully styled in Gold/Amber representing premium supplies deliveries */}
      <path 
        d="M 42,49 L 52,43 L 71,64 C 73.5,66.5 73.5,70.5 71,73 C 68.5,75.5 64.5,75.5 62,73 L 42,50 Z" 
        fill="url(#amberGoldGrad)" 
        filter="url(#softShadow)"
      />

      {/* Tiny decorative star in top right to show high-quality excellence */}
      <path 
        d="M 68,14 L 69.5,18 L 74,18.5 L 70.5,21.5 L 71.5,26 L 68,23.5 L 64.5,26 L 65.5,21.5 L 62,18.5 L 66.5,18 Z" 
        fill="#FFFFFF" 
        opacity="0.8"
      />
    </svg>
  );
};
