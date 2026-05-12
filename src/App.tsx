import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/templates/AppShell';
import { LoginPage } from './app/login/LoginPage';
import { RegisterPage } from './app/register/RegisterPage';
import { FloorPage } from './app/floor/FloorPage';
import { MenuPage } from './app/menu/MenuPage';
import { OrdersPage } from './app/orders/OrdersPage';
import { SettingsPage } from './app/settings/SettingsPage';
import { AdminPage } from './app/admin';
import { NotificationsPage } from './app/notifications/NotificationsPage';
import { useAuthStore } from './stores/authStore';

/**
 * Route guard — redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Guest route — redirects to floor if already logged in.
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/**
 * Root application component with routing.
 */
export default function App() {
  const { user, checkAuth, isAppReady } = useAuthStore();

  useEffect(() => {
    // Initial initialization: verify session before showing any routes
    checkAuth();
  }, [checkAuth]);

  if (!isAppReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-stone-500 font-medium animate-pulse">Initializing TableTap...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth (guest-only) */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected routes inside AppShell */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<FloorPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin/manage" element={<AdminPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
