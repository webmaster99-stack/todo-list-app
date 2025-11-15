import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import useAppStore from '../stores/appStore';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const registerMutation = useRegister();
  const showNotification = useAppStore((state) => state.showNotification);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await registerMutation.mutateAsync({ username, password });
      showNotification('Registration successful! Please sign in.', 'success');
      navigate('/login');
    } catch (error) {
      showNotification(`Registration failed: ${error.message}`, 'error');
      setErrors({ general: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up to get started with TodoApp.
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
            placeholder="Choose a username"
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
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          {registerMutation.isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;