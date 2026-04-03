import { Button } from '../atoms/Button';

interface ConfirmationModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * ConfirmationModal molecule
 * A simple centered modal for user confirmations (Yes/No).
 */
export function ConfirmationModal({
    title,
    message,
    confirmLabel = 'Yes',
    cancelLabel = 'No',
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-6 animate-fade-in" onClick={onCancel}>
            <div 
                className="w-full max-w-[320px] bg-white rounded-3xl p-6 shadow-2xl animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-stone-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        size="md" 
                        className="flex-1" 
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button 
                        variant="primary" 
                        size="md" 
                        className="flex-1" 
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
