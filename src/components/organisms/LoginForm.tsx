import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useAuthStore } from '../../stores/authStore';

interface LoginFormProps {
    onSuccess: () => void;
}

/**
 * LoginForm organism
 * Handles user authentication via email and password.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        await login(email, password);

        if (useAuthStore.getState().user) {
            onSuccess();
        }
    };

    return (
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

            {error && (
                <p className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100 italic">
                    {error}
                </p>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
                Sign In
            </Button>

            <p className="text-center text-sm text-stone-500 mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-600 font-semibold hover:underline">Create one</Link>
            </p>
        </form>
    );
}
