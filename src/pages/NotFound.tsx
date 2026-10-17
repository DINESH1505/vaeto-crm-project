import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="card mx-auto mt-12 max-w-md p-8 text-center">
      <h1 className="text-4xl font-black text-brand-600">404</h1>
      <h2 className="mt-2 text-lg font-bold text-navy dark:text-white">Page Not Found</h2>
      <p className="mt-1 text-xs text-muted">
        The screen or record you requested does not exist or has been moved.
      </p>
      <div className="mt-6 flex justify-center">
        <Link to="/dashboard">
          <Button variant="primary" size="sm" leftIcon={<Home className="h-4 w-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
