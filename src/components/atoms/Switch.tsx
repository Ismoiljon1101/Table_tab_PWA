import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md';
}

/**
 * Switch atom (iOS-style)
 * A premium, smooth-sliding toggle component.
 */
export function Switch({ checked, onChange, disabled = false, size = 'md' }: SwitchProps) {
    const isSm = size === 'sm';
    
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
                ${checked ? 'bg-amber-600' : 'bg-stone-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSm ? 'h-5 w-9' : 'h-6 w-11'}
            `}
        >
            <span
                className={`
                    inline-block transform rounded-full bg-white shadow-md transition duration-200 ease-in-out
                    ${isSm ? 'h-4 w-4' : 'h-5 w-5'}
                    ${checked 
                        ? (isSm ? 'translate-x-[18px]' : 'translate-x-[22px]') 
                        : 'translate-x-[2px]'
                    }
                `}
            />
        </button>
    );
}
