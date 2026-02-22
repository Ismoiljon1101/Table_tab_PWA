import './Badge.css';

interface BadgeProps {
    /** Badge text */
    label: string;
    /** Color variant matching order/table statuses */
    variant?: 'default' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'available' | 'occupied' | 'reserved' | 'danger';
}

/**
 * Status badge atom for orders and tables.
 */
export function Badge({ label, variant = 'default' }: BadgeProps) {
    return (
        <span className={`badge badge--${variant}`}>
            {label}
        </span>
    );
}
