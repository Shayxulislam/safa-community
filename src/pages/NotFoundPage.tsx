import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32 bg-[#F8FAFC] text-center px-4">
      <div className="max-w-md mx-auto">
        <span className="text-6xl font-extrabold text-[#0D47A1] block mb-2">404</span>
        <h1 className="text-2xl font-bold text-[#172033] mb-3">Page Not Found</h1>
        <p className="text-sm text-[#64748B] mb-8">
          The page you are looking for may have been moved, updated, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Return to SAFA Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
