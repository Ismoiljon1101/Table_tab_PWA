import React from 'react';

interface BadgeProps {
    /** Badge text */
    label: string;
    /** Color variant matching order/table statuses */
    variant?: 'default' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'available' | 'occupied' | 'reserved' | 'danger' | 'busy';
    className?: string;
}

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
    const baseStyles = 'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide inline-flex items-center justify-center';

    const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
        default: 'bg-stone-100 text-stone-700',
        pending: 'bg-stone-100 text-stone-600',
        confirmed: 'bg-blue-50 text-blue-700',
        preparing: 'bg-amber-100 text-amber-700',
        ready: 'bg-emerald-100 text-emerald-700',
        served: 'bg-stone-100 text-stone-400 border border-stone-200',
        available: 'bg-emerald-100 text-emerald-700',
        occupied: 'bg-amber-100 text-amber-700',
        reserved: 'bg-stone-200 text-stone-700',
        danger: 'bg-red-100 text-red-700',
        busy: 'bg-red-50 text-red-600 border border-red-100'
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {label}
        </span>
    );
}
