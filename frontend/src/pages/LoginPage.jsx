import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import useAppStore from '../stores/appStore';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const showNotification = useAppStore((state) => state.showNotification);

  // Get the page they were trying to access, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      await loginMutation.mutateAsync({ username, password });
      showNotification('Login successful!', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      showNotification(`Login failed: ${error.message}`, 'error');
      setErrors({ general: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
            {errors.general}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-destructive">{errors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/register" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;