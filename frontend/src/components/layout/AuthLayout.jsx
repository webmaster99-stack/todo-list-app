import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-foreground">
            TodoApp
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your tasks efficiently
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-card border rounded-lg shadow-lg p-6">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 TodoApp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;