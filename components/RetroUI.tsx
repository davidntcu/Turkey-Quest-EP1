import React from 'react';

interface WindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const RetroWindow: React.FC<WindowProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative bg-blue-900 border-4 border-double border-white rounded-sm p-4 text-white shadow-lg ${className}`}>
      {title && (
        <div className="absolute -top-3 left-4 bg-blue-900 px-2 text-sm font-bold border border-white">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const RetroButton: React.FC<ButtonProps> = ({ children, active, className = '', ...props }) => {
  return (
    <button
      className={`
        w-full text-left px-4 py-2 uppercase font-bold text-lg tracking-wider outline-none
        transition-colors duration-100 flex items-center
        ${active ? 'bg-orange-500 text-white animate-pulse' : 'hover:bg-blue-800 text-gray-200'}
        ${className}
      `}
      {...props}
    >
      <span className={`mr-2 ${active ? 'opacity-100' : 'opacity-0'}`}>▶</span>
      {children}
    </button>
  );
};

export const TitleBadge: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg viewBox="0 0 240 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="shieldRed" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>
        <linearGradient id="bladeSteel" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#E5E7EB" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="52%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <radialGradient id="magicOrb" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="20%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* --- Shield Group --- */}
      <g filter="url(#dropShadow)">
        {/* Shield Outline/Base */}
        <path 
          d="M120 20 C 200 20, 200 60, 200 90 C 200 160, 120 220, 120 220 C 120 220, 40 160, 40 90 C 40 60, 40 20, 120 20 Z" 
          fill="url(#shieldGold)" 
          stroke="#451a03" 
          strokeWidth="3"
        />
        {/* Inner Field */}
        <path 
          d="M120 35 C 180 35, 180 65, 180 90 C 180 145, 120 195, 120 195 C 120 195, 60 145, 60 90 C 60 65, 60 35, 120 35 Z" 
          fill="url(#shieldRed)" 
          stroke="#B45309" 
          strokeWidth="2"
        />
        
        {/* Abstract Turkey Crest (Stylized) */}
        <path 
          d="M120 60 Q 140 60, 150 80 Q 160 100, 120 140 Q 80 100, 90 80 Q 100 60, 120 60 Z" 
          fill="#D97706" 
          opacity="0.3"
        />
        <path 
          d="M120 65 Q 135 65, 140 80 Q 145 95, 120 120 Q 95 95, 100 80 Q 105 65, 120 65 Z" 
          fill="#FCD34D" 
          opacity="0.5"
        />
      </g>

      {/* --- Magic Staff (Back Right to Front Left) --- */}
      <g transform="rotate(45, 120, 120)" filter="url(#dropShadow)">
        {/* Staff Shaft */}
        <rect x="116" y="20" width="8" height="200" rx="4" fill="#3E2723" stroke="#2a1810" strokeWidth="1" />
        {/* Magic Orb Head */}
        <circle cx="120" cy="20" r="14" fill="url(#magicOrb)" />
        <circle cx="120" cy="20" r="14" fill="none" stroke="#E9D5FF" strokeWidth="2" opacity="0.8" />
      </g>

      {/* --- Knight Sword (Back Left to Front Right) --- */}
      <g transform="rotate(-45, 120, 120)" filter="url(#dropShadow)">
         {/* Blade */}
         <path d="M115 30 L120 10 L125 30 L125 180 L115 180 Z" fill="url(#bladeSteel)" stroke="#374151" strokeWidth="1" />
         {/* Center Ridge */}
         <line x1="120" y1="30" x2="120" y2="180" stroke="#9CA3AF" strokeWidth="1" />
         {/* Guard */}
         <rect x="100" y="180" width="40" height="8" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="1" />
         <rect x="105" y="178" width="30" height="12" rx="1" fill="url(#shieldGold)" opacity="0.5" />
         {/* Handle */}
         <rect x="117" y="188" width="6" height="30" fill="#451a03" />
         {/* Pommel */}
         <circle cx="120" cy="222" r="7" fill="#D97706" stroke="#78350F" strokeWidth="2" />
      </g>
      
      {/* Shine/Reflection Overlay */}
      <path 
        d="M120 30 C 130 30, 135 40, 135 60 C 135 60, 120 40, 120 30 Z" 
        fill="white" 
        opacity="0.4"
      />
    </svg>
  );
};
