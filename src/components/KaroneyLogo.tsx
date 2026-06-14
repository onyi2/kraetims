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
        {/* Deep Slate/Blue to Emerald green gradient representing literary excellence */}
        <linearGradient id="gikaPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" /> {/* Deep Royal Blue */}
          <stop offset="100%" stopColor="#0F766E" /> {/* Pine Teal */}
        </linearGradient>
        <linearGradient id="gikaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" /> {/* Amber */}
          <stop offset="100%" stopColor="#D97706" /> {/* Darker Golden */}
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Main Container - Elegant Rounded Soft Hexagon */}
      <path 
        d="M 50,4 L 88,26 L 88,74 L 50,96 L 12,74 L 12,26 Z" 
        fill="url(#gikaPrimaryGrad)" 
        stroke="url(#gikaGoldGrad)" 
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

      {/* Stylized Open Book pages in background cover layout */}
      <g opacity="0.85" filter="url(#softShadow)">
        <path d="M 50,30 C 44,28 36,30 28,34 L 28,68 C 36,64 44,62 50,64 Z" fill="#FFFFFF" />
        <path d="M 50,64 C 56,62 64,64 72,68 L 72,34 C 64,30 56,28 50,30 Z" fill="#FFFFFF" opacity="0.9" />
        {/* Ribbon bookmark falling from center (Amber gold) */}
        <path d="M 48,30 L 52,30 L 52,78 L 50,75 L 48,78 Z" fill="url(#gikaGoldGrad)" />
      </g>

      {/* Bold custom stylized capital 'G' overlaid on the center book spine */}
      <path 
        d="M 50,29 C 39,29 30,37 30,49 C 30,61 39,69 50,69 C 58,69 64,65 66,59 L 58,54 C 56,57 53,59 50,59 C 45,59 41,55 41,49 C 41,43 45,39 50,39 C 54,39 57,41 59,45 L 59,48 L 51,48 L 51,53 L 66,53 L 66,43 C 66,35 59,29 50,29 Z" 
        fill="url(#gikaGoldGrad)"
        filter="url(#softShadow)"
      />

      {/* Extra starry elements for academic distinction */}
      <path 
        d="M 68,14 L 69.5,18 L 74,18.5 L 70.5,21.5 L 71.5,26 L 68,23.5 L 64.5,26 L 65.5,21.5 L 62,18.5 L 66.5,18 Z" 
        fill="#FFFFFF" 
        opacity="0.8"
      />
    </svg>
  );
};
