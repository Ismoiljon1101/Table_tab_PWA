import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label for the input */
    label: string;
    /** Error message */
    error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            <label
                htmlFor={inputId}
                className={`text-sm font-medium ${error ? 'text-red-500' : 'text-stone-700'}`}
            >
                {label}
            </label>
            <input
                id={inputId}
                className={`w-full px-4 py-3 min-h-[44px] bg-stone-50 border rounded-xl text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow select-text ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-stone-200 focus:border-amber-500'
                    }`}
                {...props}
            />
            {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
        </div>
    );
}
