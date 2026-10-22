import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, Key, ArrowRight, Eye, EyeOff, AlertCircle, User as UserIcon, UserPlus, Loader2 } from 'lucide-react';
import { auth } from '../services/auth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SafaLogo } from '../components/ui/SafaLogo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [accountType, setAccountType] = useState<'owner' | 'admin'>((searchParams.get('type') || searchParams.get('adminType')) === 'admin' ? 'admin' : 'owner');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const result = await auth.login(accountType, password);
      if (result.success) navigate('/admin/dashboard');
      else setError(result.error || 'Access denied.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="py-16 sm:py-24 bg-[#F1EDE4] min-h-screen text-[#3D3B36] flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto text-left">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3 group">
            <div className="w-16 h-16 rounded-3xl bg-white border border-[#BFDBFE] p-2.5 mx-auto flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <SafaLogo variant="mark" size={48} color="#0056D2" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FC] border border-[#BFDBFE] text-[#0056D2] text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>SAFA Staff Access</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#3D3B36]">
            Staff Portal
          </h1>
          <p className="text-sm text-[#6D6A61] mt-1.5 max-w-sm mx-auto">
            Select your admin type and enter its password to continue.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-[#FDFCF9] shadow-md border border-[#E5E0D5] rounded-3xl">
          {searchParams.get('changed') === '1' && <p role="status" className="p-3 rounded-xl bg-green-50 text-green-800 text-sm">Password changed. Sign in with your new password.</p>}
          {error && (
            <div
              id="admin-login-error"
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2.5 animate-shake"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-type-select" className="block text-xs font-bold mb-1.5">Admin type</label>
              <select id="admin-type-select" name="adminType" value={accountType} disabled={isLoading} onChange={e => { setAccountType(e.target.value as 'owner' | 'admin'); setPassword(''); setError(''); }} className="w-full px-3 py-2.5 border rounded-xl border-[#E5E0D5] bg-white text-sm">
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password Input (Required) */}
            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#6D6A61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder={`Enter ${accountType === 'owner' ? 'Owner' : 'Admin'} password`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52] focus:ring-1 focus:ring-[#5E6E52]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6A61] hover:text-[#3D3B36] p-1 rounded-md transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              id="admin-login-button"
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center"
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? 'Signing in...' : 'Enter Admin Panel'}
            </Button>
          </form>


        </Card>

        {/* Return to Public Website */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-[#6D6A61] hover:text-[#3D3B36] hover:underline inline-flex items-center gap-1.5"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
