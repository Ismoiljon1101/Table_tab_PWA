import { create } from 'zustand';

interface ToastItem {
    /** Unique identifier */
    id: string;
    /** Message to display */
    message: string;
    /** Visual type */
    type: 'success' | 'error' | 'info';
}

interface ToastState {
    /** Active toasts (max 3 shown at once) */
    toasts: ToastItem[];
    /** Show a success toast */
    success: (message: string) => void;
    /** Show an error toast */
    error: (message: string) => void;
    /** Show an info toast */
    info: (message: string) => void;
    /** Manually dismiss a toast */
    dismiss: (id: string) => void;
}

/**
 * Global toast store using Zustand.
 * Call useToast() from any component — no Provider required.
 * Toasts auto-dismiss after 3s.
 */
export const useToast = create<ToastState>((set, get) => {
    const add = (message: string, type: ToastItem['type']) => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, type }] }));
        setTimeout(() => get().dismiss(id), 3000);
    };

    return {
        toasts: [],
        success: (message) => add(message, 'success'),
        error: (message) => add(message, 'error'),
        info: (message) => add(message, 'info'),
        dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    };
});
