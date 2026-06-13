import React from 'react';

interface RocksideLogoProps {
  className?: string;
  size?: number;
}

export const RocksideLogo: React.FC<RocksideLogoProps> = ({ 
  className = '', 
  size = 80 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 105" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        {/* Clip path to constrain quadrant backgrounds within the shield boundary */}
        <clipPath id="shield-clip">
          <path d="M 50,12 C 78,12 88,16 88,20 C 88,48 78,76 50,90 C 22,76 12,48 12,20 C 12,16 22,12 50,12 Z" />
        </clipPath>
        
        {/* Ribbon path for curved text wrapping */}
        <path id="ribbonPath" d="M 17,86.5 Q 50,96 83,86.5" fill="none" />
      </defs>

      {/* Main Shield with Clip Path for Quadrants */}
      <g clipPath="url(#shield-clip)">
        {/* Backgrounds of Quadrants */}
        {/* Top-Left Quadrant: Blue Field */}
        <rect x="0" y="0" width="50" height="50" fill="#1e3a8a" />
        
        {/* Top-Right Quadrant: Off-White Field */}
        <rect x="50" y="0" width="50" height="50" fill="#f8fafc" />
        
        {/* Bottom-Left Quadrant: Subtle Pink Field */}
        <rect x="0" y="50" width="50" height="55" fill="#fdf0f6" />
        
        {/* Bottom-Right Quadrant: Teal/Blue Field */}
        <rect x="50" y="50" width="50" height="55" fill="#0f766e" />

        {/* --- Top-Left Content: Elegant Overlapping ABC --- */}
        <g transform="translate(1, 0)">
          {/* Main 'A' */}
          <text x="25" y="38" fontFamily="'Georgia', serif" fontSize="22" fontWeight="900" fill="#ffffff" textAnchor="middle" opacity="0.95">A</text>
          {/* Mini 'B' stylized and overlapping */}
          <text x="14" y="32" fontFamily="'Georgia', serif" fontSize="11" fontWeight="bold" fill="#f59e0b" textAnchor="middle" opacity="0.9">B</text>
          {/* Mini 'C' stylized and overlapping */}
          <text x="35" y="42" fontFamily="'Georgia', serif" fontSize="11" fontWeight="bold" fill="#38bdf8" textAnchor="middle" opacity="0.9">C</text>
        </g>

        {/* --- Top-Right Content: Interactive children (yellow & maroon) representing primary education --- */}
        <g transform="translate(3, -2)">
          {/* First child (Yellow/Gold) */}
          <circle cx="60" cy="27" r="4.5" fill="#eab308" />
          <path d="M 52,43 C 52,36 68,36 68,43 Z" fill="#eab308" />
          
          {/* Second child (Maroon/Pink) */}
          <circle cx="71" cy="29" r="4" fill="#be185d" />
          <path d="M 64,44 C 64,38 78,38 78,44 Z" fill="#be185d" />
        </g>

        {/* --- Bottom-Left Content: Open book of continuous learning --- */}
        <g transform="translate(18, 56) scale(0.65)">
          {/* Outer Cover shadow */}
          <path d="M 22,21 Q 12,18 2,21 L 2,9 Q 12,6 22,9 Z" fill="#be123c" />
          <path d="M 22,21 Q 32,18 42,21 L 42,9 Q 32,6 22,9 Z" fill="#9f1239" />
          
          {/* Dynamic White Pages */}
          <path d="M 22,19 Q 12,16 2,19 L 2,7 Q 12,4 22,7 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="0.8" />
          <path d="M 22,19 Q 32,16 42,19 L 42,7 Q 32,4 22,7 Z" fill="#fff1f2" stroke="#e11d48" strokeWidth="0.8" />
          
          {/* Center binding seam */}
          <line x1="22" y1="7" x2="22" y2="19" stroke="#be123c" strokeWidth="1.2" />
        </g>

        {/* --- Bottom-Right Content: Graduation Diploma Scroll --- */}
        <g transform="translate(68, 65) rotate(-40) scale(0.7)">
          {/* Scroll tube */}
          <rect x="-14" y="-4" width="28" height="8" rx="2.5" fill="#ffffff" stroke="#042f2e" strokeWidth="1" />
          {/* Gold ribbon tier */}
          <rect x="-3" y="-5.2" width="6" height="10.4" fill="#f59e0b" rx="0.5" />
          {/* Hanging tails of ribbon */}
          <path d="M -1.5,5.2 L -3.5,12 L 0.5,10 L 4.5,12 L 2.5,5.2 Z" fill="#d97706" />
        </g>

        {/* Gold Grid Divider cross separating elements */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="#f59e0b" strokeWidth="2.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f59e0b" strokeWidth="2.5" />
      </g>

      {/* --- Elegant Outer Shield Border --- */}
      <path 
        d="M 50,12 C 78,12 88,16 88,20 C 88,48 78,76 50,90 C 22,76 12,48 12,20 C 12,16 22,12 50,12 Z" 
        fill="none" 
        stroke="#eab308" 
        strokeWidth="3" 
        strokeLinejoin="round"
      />
      {/* Inner fine border */}
      <path 
        d="M 50,14 C 75,14 85,18 85,21 C 85,46 75,73 50,86 C 25,73 15,46 15,21 C 15,18 25,14 50,14 Z" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="1" 
        opacity="0.8" 
        strokeLinejoin="round"
      />

      {/* --- Bottom Ribbon & Banner Crest with school name --- */}
      {/* Ribbon Shadow Elements */}
      <path d="M 13,87 L 7,95 L 20,95 Z" fill="#be123c" />
      <path d="M 87,87 L 93,95 L 80,95 Z" fill="#be123c" />
      <path d="M 7,95 L 3,91 L 11,85 Z" fill="#9f1239" opacity="0.7" />
      <path d="M 93,95 L 97,91 L 89,85 Z" fill="#9f1239" opacity="0.7" />

      {/* Ribbon Main Plate */}
      <path 
        d="M 10,81.5 Q 50,91.5 90,81.5 L 87,91.5 Q 50,101.5 13,91.5 Z" 
        fill="#be123c" 
        stroke="#f59e0b" 
        strokeWidth="1.2" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 11,83 Q 50,93 89,83 L 87.5,89 Q 50,99 12.5,89 Z" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="0.8" 
        opacity="0.6"
      />

      {/* Curved Text wrapped dynamically */}
      <text fill="#ffffff" fontFamily="'Cinzel', 'Outfit', 'Georgia', serif" fontWeight="900" fontSize="6.3" letterSpacing="0.4" textAnchor="middle">
        <textPath href="#ribbonPath" startOffset="50%">
          ROCKSIDE ACADEMY
        </textPath>
      </text>

      {/* Tiny Center Golden Star below ribbon as decorative anchor */}
      <polygon points="50,97.5 51.5,100.5 54.5,101 52.2,103 52.8,106 50,104.5 47.2,106 47.8,103 45.5,101 48.5,100.5" fill="#f59e0b" />
    </svg>
  );
};
