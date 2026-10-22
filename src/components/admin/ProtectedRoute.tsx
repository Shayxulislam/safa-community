import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import type { User } from '../../types';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const profile = await auth.restoreSession();
        if (active) { setUser(profile); setError(''); }
      } catch { if (active) setError('We could not check your session. Please retry.'); }
      finally { if (active) setPending(false); }
    };
    setPending(true); void check();
    const onChange = () => { if (active) setUser(auth.getCurrentUser()); };
    const onFocus = () => { if (!document.hidden) void check(); };
    window.addEventListener('safa-auth-changed', onChange);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const timer = window.setInterval(() => { if (!document.hidden) void check(); }, 60000);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('safa-auth-changed', onChange); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, [retry]);
  if (error) return <div role="alert" className="p-10 text-center"><p>{error}</p><button className="mt-4 rounded-xl bg-blue-700 text-white px-5 py-2" onClick={() => setRetry(v => v + 1)}>Retry</button></div>;
  if (pending) return <p role="status" className="p-10 text-center">Checking staff access…</p>;
  if (!user || user.status !== 'active' || !['super_admin', 'admin'].includes(user.role)) return <Navigate to={auth.getSignInPath()} replace />;
  return <>{children}</>;
}
