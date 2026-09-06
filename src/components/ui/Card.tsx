import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#C1E8FF] shadow-xs ${
        hover ? 'transition-all duration-200 hover:border-[#7DA0CA] hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
