import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../stores/toastStore';

/**
 * ToastContainer atom
 * Renders all active toasts from the global toastStore.
 * Mount this once in AppShell — toasts work everywhere automatically.
 */
export function ToastContainer() {
    const { toasts, dismiss } = useToast();

    return (
        <div className="fixed top-4 inset-x-4 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: -16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto ${
                            t.type === 'success' ? 'bg-emerald-600 text-white' :
                            t.type === 'error'   ? 'bg-red-600 text-white' :
                                                   'bg-stone-900 text-white'
                        }`}
                    >
                        {t.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
                        {t.type === 'error'   && <XCircle    size={18} className="shrink-0" />}
                        {t.type === 'info'    && <Info        size={18} className="shrink-0" />}
                        <p className="text-sm font-semibold leading-snug flex-1">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
