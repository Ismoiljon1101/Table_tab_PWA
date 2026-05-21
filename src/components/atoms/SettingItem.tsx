import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingItemProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    className?: string;
    showChevron?: boolean;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

/**
 * SettingItem atom
 * A single row in a settings list with an icon, label, and optional action/value.
 */
export function SettingItem({
    icon,
    label,
    value,
    onClick,
    rightElement,
    className = '',
    showChevron = true,
    variant = 'default',
    disabled = false
}: SettingItemProps) {
    const isClickable = !!onClick && !disabled;
    const textColor = variant === 'danger' ? 'text-red-500' : 'text-stone-700';
    const iconColor = variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-500';

    const innerContent = (
        <>
            <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconColor}`}>
                {icon}
            </div>
            
            <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${textColor}`}>
                    {label}
                </p>
                {value && (
                    <p className="text-xs text-stone-400 mt-0.5 truncate uppercase tracking-wider">
                        {value}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {rightElement && (
                    <div className="flex-shrink-0">
                        {rightElement}
                    </div>
                )}
                {isClickable && showChevron && (
                    <ChevronRight size={16} className="text-stone-300" />
                )}
            </div>
        </>
    );

    const baseClass = `
        flex items-center gap-3 px-4 py-3.5 min-h-[52px] w-full transition-all duration-150
        ${isClickable ? 'active:bg-stone-100 active:scale-[0.98] cursor-pointer' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
    `;

    if (onClick) {
        return (
            <button
                type="button"
                onClick={disabled ? undefined : onClick}
                disabled={disabled}
                className={baseClass}
            >
                {innerContent}
            </button>
        );
    }

    return (
        <div className={baseClass}>
            {innerContent}
        </div>
    );
}
