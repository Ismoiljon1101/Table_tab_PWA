import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { useAuthStore } from '../../stores/authStore';
import './RegisterPage.css';

/**
 * Register page — creates admin account + restaurant.
 * Waiters are invited via a separate flow (future).
 */
export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        await register(email, password, nickname, restaurantName);

        if (useAuthStore.getState().user) {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="register-page">
            <div className="register-page__hero animate-fade-in">
                <div className="register-page__icon">
                    <UtensilsCrossed size={28} strokeWidth={2} />
                </div>
                <h1 className="register-page__title">Get Started</h1>
                <p className="register-page__subtitle">Create your restaurant account</p>
            </div>

            <form className="register-page__form animate-slide-up" onSubmit={handleSubmit}>
                <Input
                    label="Your Name"
                    type="text"
                    placeholder="What should we call you?"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    autoComplete="name"
                />

                <Input
                    label="Restaurant Name"
                    type="text"
                    placeholder="Your restaurant's name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                />

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
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                />

                {error && <p className="register-page__error">{error}</p>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                    Create Account
                </Button>

                <p className="register-page__footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </p>
            </form>
        </div>
    );
}
