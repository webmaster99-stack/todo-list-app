import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;