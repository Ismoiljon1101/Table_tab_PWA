/**
 * Format a number as currency string.
 * Uses the restaurant's configured currency (default: USD).
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a date string for display.
 * Returns relative time for today, otherwise shows date.
 */
export function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date string to short time string (e.g., "2:30 PM").
 */
export function formatClockTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Generate initials from a name string.
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
