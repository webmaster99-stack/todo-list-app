import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { useRequestPasswordReset } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';

function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestResetMutation = useRequestPasswordReset();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      await requestResetMutation.mutateAsync(username);
      setIsSubmitted(true);
    } catch (error) {
      // We still show success message to prevent username enumeration
      // Backend should return same response for valid/invalid users
      setIsSubmitted(true);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your console</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists with that username, a password reset link has been generated.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">For Development:</p>
          <p className="text-muted-foreground">
            Check your <strong>backend console</strong> for the reset link. 
            The token will be displayed there.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              setUsername('');
            }}
          >
            Try another username
          </Button>
          
          <Link to="/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Forgot password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={requestResetMutation.isPending}
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={requestResetMutation.isPending}
          className="w-full"
        >
          {requestResetMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;