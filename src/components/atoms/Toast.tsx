import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
    /** Message to display */
    message: string;
    /** Visual type */
    type: 'success' | 'error';
    /** Called when toast finishes (auto-dismiss or manual) */
    onDismiss: () => void;
    /** Auto-dismiss after ms, defaults to 3000 */
    duration?: number;
}

/**
 * Toast atom
 * A non-blocking notification that auto-dismisses.
 * Replaces native alert() calls to avoid blocking the main thread.
 */
export function Toast({ message, type, onDismiss, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [onDismiss, duration]);

    const isSuccess = type === 'success';

    return (
        <div
            className="fixed top-4 inset-x-4 z-[9999] flex justify-center animate-fade-in"
            onClick={onDismiss}
        >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-sm w-full ${
                isSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
            }`}>
                {isSuccess
                    ? <CheckCircle size={20} className="shrink-0" />
                    : <XCircle size={20} className="shrink-0" />
                }
                <p className="text-sm font-semibold leading-snug">{message}</p>
            </div>
        </div>
    );
}
