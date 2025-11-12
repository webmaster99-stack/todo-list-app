import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useAppStore from '../stores/appStore';
import { useLogin, useLogout } from '../hooks/useAuth';
import { useAuthInit } from '../hooks/useAuthInit';

function ZustandTest() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Initialize auth
  useAuthInit();

  // Auth store
  const { token, user, isAuthenticated, loginTime, isTokenExpired } = useAuthStore();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // App store
  const { isSidebarOpen, notification, toggleSidebar, showNotification } = useAppStore();

  // Mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
      showNotification('Login successful!', 'success');
      setUsername('');
      setPassword('');
    } catch (error) {
      showNotification(`Login failed: ${error.message}`, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      showNotification('Logged out successfully', 'info');
    } catch (error) {
      showNotification(`Logout failed: ${error.message}`, 'error');
    }
  };

  const getTimeRemaining = () => {
    if (!loginTime) return 'N/A';
    
    const elapsed = Date.now() - loginTime;
    const remaining = (24 * 60 * 60 * 1000) - elapsed;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Zustand Auth Store Test</h2>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Auth Status */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authenticated:</span>
            <span className={isAuthenticated ? 'text-green-600 font-semibold' : 'text-red-600'}>
              {isAuthenticated ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Has Token:</span>
            <span>{token ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username:</span>
            <span>{user?.username || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Expired:</span>
            <span className={isTokenExpired() ? 'text-red-600' : 'text-green-600'}>
              {isTokenExpired() ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time Remaining:</span>
            <span>{getTimeRemaining()}</span>
          </div>
          {token && (
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
              Token: {token.substring(0, 50)}...
            </div>
          )}
        </div>
      </div>

      {/* Login/Logout */}
      {!isAuthenticated ? (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Login</h3>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Logged In</h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You are logged in as <strong>{user?.username}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
              <button
                onClick={clearAuth}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Clear Auth (Manual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI State Demo */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">UI State (App Store)</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Sidebar Open:</span>
            <div className="flex items-center gap-2">
              <span className={isSidebarOpen ? 'text-green-600' : 'text-red-600'}>
                {isSidebarOpen ? 'Yes' : 'No'}
              </span>
              <button
                onClick={toggleSidebar}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Toggle
              </button>
            </div>
          </div>
          <button
            onClick={() => showNotification('This is a test notification!', 'info')}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Show Test Notification
          </button>
        </div>
      </div>

      {/* LocalStorage */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">LocalStorage</h3>
        <div className="text-sm space-y-2">
          <div>
            <span className="text-muted-foreground">Token: </span>
            <span className="font-mono text-xs">
              {localStorage.getItem('token') ? 'Present' : 'None'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">User: </span>
            <span className="font-mono text-xs">
              {localStorage.getItem('user') ? 'Present' : 'None'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Auth Storage: </span>
            <span className="font-mono text-xs">
              {localStorage.getItem('auth-storage') ? 'Present' : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZustandTest;