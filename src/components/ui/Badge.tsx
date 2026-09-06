import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'neutral' | 'amber' | 'purple';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className = '',
  icon
}) => {
  const variants = {
    blue: 'bg-[#EAF4FF] text-[#0D47A1] border-[#cbe4ff]',
    green: 'bg-[#DCFCE7] text-[#166534] border-[#bbf7d0]',
    neutral: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border-[#fde68a]',
    purple: 'bg-[#F3E8FF] text-[#6B21A8] border-[#e9d5ff]'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
