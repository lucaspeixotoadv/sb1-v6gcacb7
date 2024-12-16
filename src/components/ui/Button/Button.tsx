import React from 'react';
import { cn } from '../../../utils/cn';
import { LoadingSpinner } from './LoadingSpinner';
import type { ButtonProps } from './types';
import { buttonVariants } from './variants';

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        isLoading && 'opacity-70 cursor-not-allowed',
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}