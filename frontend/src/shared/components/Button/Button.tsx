import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    children,
    className = '',
    ...rest
}) => {
    const base =
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none';

    const variants: Record<string, string> = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm',
        ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    };

    const sizes: Record<string, string> = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${className}`}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};