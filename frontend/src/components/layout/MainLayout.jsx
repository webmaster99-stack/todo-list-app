import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import useAppStore from '../../stores/appStore';

function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const showNotification = useAppStore((state) => state.showNotification);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      showNotification('Logged out successfully', 'info');
      navigate('/login');
    } catch (error) {
      showNotification(`Logout failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-xl font-bold text-foreground">
                TodoApp
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;