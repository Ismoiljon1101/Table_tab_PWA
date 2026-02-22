import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { useAuthStore } from '../../stores/authStore';

/**
 * Login page — email + password authentication.
 */
export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        await login(email, password);

        if (useAuthStore.getState().user) {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-[100dvh] max-w-[400px] mx-auto p-6">
            <div className="text-center mb-10 animate-fade-in">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/25">
                    <UtensilsCrossed size={32} strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-stone-900 mb-1">TableTap</h1>
                <p className="text-sm text-stone-500">Smart order-taking for your team</p>
            </div>

            <form className="flex flex-col gap-4 animate-slide-up" onSubmit={handleSubmit}>
                <Input
                    label="Email"
                    type="email"
                    placeholder="you@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    minLength={6}
                />

                {error && <p className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium">{error}</p>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                    Sign In
                </Button>

                <p className="text-center text-sm text-stone-500 mt-2">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-amber-600 font-semibold hover:underline">Create one</Link>
                </p>
            </form>
        </div>
    );
}
