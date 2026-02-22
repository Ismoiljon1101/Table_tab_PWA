import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Building2, User } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { useAuthStore } from '../../stores/authStore';

type SignupMode = 'owner' | 'waiter';

/**
 * Register page — creates admin account + restaurant or waiter account joining a restaurant.
 */
export function RegisterPage() {
    const [mode, setMode] = useState<SignupMode>('owner');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [restaurantId, setRestaurantId] = useState('');

    const { register, registerWaiter, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        if (mode === 'owner') {
            await register(email, password, nickname, restaurantName);
        } else {
            await registerWaiter(email, password, nickname, restaurantId);
        }

        if (useAuthStore.getState().user) {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-[100dvh] max-w-[400px] mx-auto p-6 py-12">
            <div className="text-center mb-8 animate-fade-in">
                <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/25">
                    <UtensilsCrossed size={28} strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-stone-900 mb-1">Get Started</h1>
                <p className="text-sm text-stone-500">Join TableTap with your team</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8 animate-slide-up">
                <button
                    type="button"
                    onClick={() => { setMode('owner'); clearError(); }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${mode === 'owner'
                            ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                            : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200 hover:bg-stone-50'
                        }`}
                >
                    <Building2 size={24} className={mode === 'owner' ? 'text-amber-600' : 'text-stone-400'} />
                    <span className="text-sm font-semibold">Owner</span>
                </button>

                <button
                    type="button"
                    onClick={() => { setMode('waiter'); clearError(); }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${mode === 'waiter'
                            ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                            : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200 hover:bg-stone-50'
                        }`}
                >
                    <User size={24} className={mode === 'waiter' ? 'text-amber-600' : 'text-stone-400'} />
                    <span className="text-sm font-semibold">Staff</span>
                </button>
            </div>

            <form className="flex flex-col gap-4 animate-slide-up" onSubmit={handleSubmit}>
                <Input
                    label="Your Name"
                    type="text"
                    placeholder="What should we call you?"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    autoComplete="name"
                />

                {mode === 'owner' ? (
                    <Input
                        label="Restaurant Name"
                        type="text"
                        placeholder="Your restaurant's name"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        required
                    />
                ) : (
                    <div>
                        <Input
                            label="Restaurant ID"
                            type="text"
                            placeholder="e.g. 60d5ecb8b..."
                            value={restaurantId}
                            onChange={(e) => setRestaurantId(e.target.value)}
                            required
                        />
                        <p className="text-[11px] text-stone-500 mt-1.5 ml-1">Ask your manager for this ID to join their workspace.</p>
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@email.com"
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

                {error && <p className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium">{error}</p>}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading} className="mt-2">
                    {mode === 'owner' ? 'Create Restaurant' : 'Join Team'}
                </Button>

                <p className="text-center text-sm text-stone-500 mt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </form>
        </div>
    );
}
