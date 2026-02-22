import './Input.css';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label for the input */
    label: string;
    /** Error message */
    error?: string;
}

/**
 * Text input atom with floating-label style.
 */
export function Input({ label, error, id, className = '', ...props }: InputProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
            <label htmlFor={inputId} className="input-group__label">
                {label}
            </label>
            <input
                id={inputId}
                className="input-group__field"
                {...props}
            />
            {error && <span className="input-group__error">{error}</span>}
        </div>
    );
}
