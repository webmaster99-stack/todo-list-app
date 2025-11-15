import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import useAppStore from './stores/appStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  // Initialize auth state
  useAuthInit();

  // Get notification from store
  const notification = useAppStore((state) => state.notification);
  const hideNotification = useAppStore((state) => state.hideNotification);

  return (
    <BrowserRouter>
      {/* Global Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-4 py-3 rounded-lg border shadow-lg max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={hideNotification}
                className="text-current opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
        </Route>

        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;