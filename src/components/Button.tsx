import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  direction?: 'prev' | 'next';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  direction,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {direction === 'prev' && <ArrowLeft className="w-4 h-4" />}
      {children}
      {direction === 'next' && <ArrowRight className="w-4 h-4" />}
    </button>
  );
};