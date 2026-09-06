import React from 'react';

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeIcon,
  title,
  description,
  align = 'center',
  className = ''
}) => {
  return (
    <div
      className={`mb-10 ${
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl'
      } ${className}`}
    >
      {badge && (
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5] mb-3.5 shadow-2xs ${align === 'center' ? 'mx-auto' : ''}`}>
          {badgeIcon && <span className="shrink-0">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base sm:text-lg text-[#6D6A61] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
