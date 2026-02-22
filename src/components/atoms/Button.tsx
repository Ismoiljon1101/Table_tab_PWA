import React from 'react';
import './Button.css';

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

/**
 * Primary interactive button atom.
 * Supports 4 variants and 3 sizes with loading state.
 */
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
    return (
        <button
            className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className="btn__spinner" /> : children}
        </button>
    );
}
