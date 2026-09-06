import React from 'react';

interface SafaLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  className?: string;
  size?: number | string;
  color?: string;
}

export const SafaLogo: React.FC<SafaLogoProps> = ({
  variant = 'mark',
  className = '',
  size = 40,
  color = '#0056D2'
}) => {
  if (variant === 'full') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <img
          src="/logo.png"
          alt="SAFA - Connecting Hands, Changing Lives"
          style={{ width: size, height: size }}
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <SafaLogo variant="mark" size={size} color={color} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-serif font-black tracking-tight text-[#172033] leading-none">
              SAFA
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EBF3FC] text-[#0056D2] border border-[#BFDBFE]">
              UZB
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium tracking-tight mt-0.5">
            Connecting Hands, Changing Lives
          </span>
        </div>
      </div>
    );
  }

  // Default: 'mark' - Official SAFA emblem asset
  return (
    <img
      src="/logo.png"
      alt="SAFA Official Emblem"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
    />
  );
};
