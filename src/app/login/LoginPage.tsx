import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { AuthTemplate } from '../../components/templates/AuthTemplate';
import { LoginForm } from '../../components/organisms/LoginForm';

/**
 * LoginPage
 * Refactored to use Atomic Design (Templates, Organisms).
 */
export function LoginPage() {
    const navigate = useNavigate();

    const header = (
        <div className="text-center mb-0">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/25">
                <UtensilsCrossed size={32} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">TableTap</h1>
            <p className="text-sm text-stone-500">Smart order-taking for your team</p>
        </div>
    );

    return (
        <AuthTemplate header={header}>
            <LoginForm onSuccess={() => navigate('/', { replace: true })} />
        </AuthTemplate>
    );
}
