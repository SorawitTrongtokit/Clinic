'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

// Combine Framer Motion props with HTML Button props
type CombinedProps = ButtonProps & HTMLMotionProps<"button">;

const Button = forwardRef<HTMLButtonElement, CombinedProps>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg border-0',
        secondary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg border-0',
        outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 hover:border-blue-200 shadow-sm',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg border-0',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-5 text-sm rounded-xl',
        lg: 'h-12 px-8 text-base rounded-2xl',
    };

    return (
        <motion.button
            ref={ref}
            layout
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
                'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = 'Button';

export { Button, cn };
