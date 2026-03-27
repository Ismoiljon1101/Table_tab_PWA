import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { AuthTemplate } from '../../components/templates/AuthTemplate';
import { RegisterForm } from '../../components/organisms/RegisterForm';

/**
 * RegisterPage
 * Refactored to use Atomic Design (Templates, Organisms).
 */
export function RegisterPage() {
    const navigate = useNavigate();

    const header = (
        <div className="text-center mb-0">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/25">
                <UtensilsCrossed size={28} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Get Started</h1>
            <p className="text-sm text-stone-500">Join TableTap with your team</p>
        </div>
    );

    return (
        <AuthTemplate header={header}>
            <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
        </AuthTemplate>
    );
}
