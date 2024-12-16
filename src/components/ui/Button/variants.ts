import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white hover:bg-gray-900 focus-visible:ring-black focus-visible:ring-offset-2',
        secondary: 'bg-gray-800 text-white hover:bg-gray-700 focus-visible:ring-gray-800',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-black',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
        link: 'text-black underline-offset-4 hover:underline focus-visible:ring-black'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);