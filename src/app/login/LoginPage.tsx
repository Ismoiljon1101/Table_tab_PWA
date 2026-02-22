import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { useAuthStore } from '../../stores/authStore';
import './LoginPage.css';

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
        <div className="login-page">
            <div className="login-page__hero animate-fade-in">
                <div className="login-page__icon">
                    <UtensilsCrossed size={32} strokeWidth={2} />
                </div>
                <h1 className="login-page__title">TableTap</h1>
                <p className="login-page__subtitle">Smart order-taking for your team</p>
            </div>

            <form className="login-page__form animate-slide-up" onSubmit={handleSubmit}>
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

                {error && <p className="login-page__error">{error}</p>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                    Sign In
                </Button>

                <p className="login-page__footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </p>
            </form>
        </div>
    );
}
