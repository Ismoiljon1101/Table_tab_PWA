import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/templates/AppShell';
import { LoginPage } from './app/login/LoginPage';
import { RegisterPage } from './app/register/RegisterPage';
import { FloorPage } from './app/floor/FloorPage';
import { MenuPage } from './app/menu/MenuPage';
import { OrdersPage } from './app/orders/OrdersPage';
import { SettingsPage } from './app/settings/SettingsPage';
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
