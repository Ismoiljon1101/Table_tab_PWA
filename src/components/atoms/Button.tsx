import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Fill the parent width */
    fullWidth?: boolean;
    /** Show loading spinner */
    loading?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-700 shadow-sm active:scale-95',
        secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 active:bg-stone-200 active:scale-95',
        ghost: 'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-100 active:text-stone-900',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-100 active:scale-95'
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm min-h-[44px]',
        md: 'px-4 py-2.5 text-sm min-h-[44px]',
        lg: 'px-6 py-3.5 text-base min-h-[52px]'
    };

    const classes = [
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
