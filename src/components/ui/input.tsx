import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border bg-[#0d0d15] px-3 text-sm text-gray-100',
        'placeholder:text-gray-600 outline-none',
        'transition-colors duration-150',
        'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
          : 'border-[#2a2a38]',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
