import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';
import useAppStore from '../stores/appStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const registerMutation = useRegister();
  const showNotification = useAppStore((state) => state.showNotification);

  // Password requirements
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (touched.username) {
      if (!username.trim()) {
        newErrors.username = 'Username is required';
      } else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (username.length > 50) {
        newErrors.username = 'Username must be at most 50 characters';
      } else if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(username)) {
        newErrors.username = 'Username must start with a letter/number and contain only letters, numbers, underscores, and hyphens';
      }
    }

    if (touched.password) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (!allRequirementsMet) {
        newErrors.password = 'Password does not meet all requirements';
      }
    }

    if (touched.confirmPassword) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
  }, [username, password, confirmPassword, touched, allRequirementsMet]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ username: true, password: true, confirmPassword: true });

    // Validate
    if (Object.keys(errors).length > 0 || !allRequirementsMet) {
      return;
    }

    try {
      await registerMutation.mutateAsync({ username, password });
      showNotification('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (error) {
      showNotification(error.message || 'Registration failed', 'error');
      setErrors({ general: error.message || 'Registration failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up to get started with TodoApp.
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="flex items-start gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{errors.general}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur('username')}
            error={touched.username && errors.username}
            placeholder="Choose a username"
            autoComplete="username"
            disabled={registerMutation.isPending}
          />
          {touched.username && errors.username && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.username}
            </p>
          )}
          {touched.username && !errors.username && username && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Username looks good!
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={registerMutation.isPending}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {password && (
            <div className="space-y-1 text-xs">
              <p className="font-medium text-muted-foreground">Password must contain:</p>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Uppercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Lowercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {passwordRequirements.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Number
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword && errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={registerMutation.isPending}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.confirmPassword}
            </p>
          )}
          {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Passwords match!
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={registerMutation.isPending || (touched.password && !allRequirementsMet)}
          className="w-full"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link 
          to="/login" 
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
