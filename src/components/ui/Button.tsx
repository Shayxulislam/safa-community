import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const variants = {
    primary: 'bg-[#052659] text-white hover:bg-[#021024] active:bg-[#021024] focus-visible:outline-[#5483B3] shadow-xs hover:shadow-sm',
    secondary: 'bg-[#C1E8FF] text-[#052659] hover:bg-[#7DA0CA] active:bg-[#5483B3] border border-[#C1E8FF] focus-visible:outline-[#5483B3]',
    outline: 'border border-[#5483B3] bg-white text-[#052659] hover:bg-[#C1E8FF]/40 hover:border-[#052659] focus-visible:outline-[#5483B3] shadow-xs',
    ghost: 'text-[#052659] hover:bg-[#C1E8FF]/60 active:bg-[#7DA0CA]/40 focus-visible:outline-[#5483B3]',
    danger: 'bg-[#021024] text-white hover:bg-[#052659] active:bg-[#021024] focus-visible:outline-[#5483B3]'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-1.5 min-h-[36px]',
    md: 'text-sm px-4.5 py-2 rounded-xl gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 min-h-[46px]'
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
