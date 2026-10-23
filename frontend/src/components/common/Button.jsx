import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066FF]/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-xs hover:shadow border border-blue-600/30',
    secondary:
      'bg-white hover:bg-slate-50 text-[#1E293B] border border-[#E2E8F0] shadow-xs hover:border-slate-300',
    outline:
      'bg-transparent border border-[#0066FF] text-[#0066FF] hover:bg-blue-50/60',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-[#1E293B]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    subtle:
      'bg-blue-50 hover:bg-blue-100/80 text-[#0066FF] border border-blue-100',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
