import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, Check, X, CheckCircle2, XCircle } from 'lucide-react';
import { useResetPassword } from '../hooks/useAuth';
import useAppStore from '../stores/appStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();
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
  }, [password, confirmPassword, touched, allRequirementsMet]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ password: true, confirmPassword: true });

    if (!allRequirementsMet || password !== confirmPassword) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ 
        token, 
        newPassword: password 
      });
      setIsSuccess(true);
    } catch (error) {
      showNotification(error.message || 'Failed to reset password', 'error');
      setErrors({ general: error.message || 'Invalid or expired reset token' });
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Invalid link</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is invalid or missing a token.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/forgot-password" className="block">
            <Button className="w-full">
              Request new reset link
            </Button>
          </Link>
          
          <Link to="/login" className="block">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Password reset!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        <Link to="/login" className="block">
          <Button className="w-full">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Set new password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="flex items-start gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{errors.general}</p>
            <Link 
              to="/forgot-password" 
              className="underline font-medium mt-1 inline-block"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && errors.password}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={resetPasswordMutation.isPending}
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
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword && errors.confirmPassword}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={resetPasswordMutation.isPending}
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
          disabled={resetPasswordMutation.isPending || !allRequirementsMet}
          className="w-full"
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link 
          to="/login" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ResetPasswordPage;