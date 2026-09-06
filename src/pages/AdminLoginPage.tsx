import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Key, ArrowRight, Eye, EyeOff, AlertCircle, User as UserIcon, UserPlus, Loader2 } from 'lucide-react';
import { auth, ROLE_DETAILS, ADMIN_ACCESS_PASSWORD } from '../services/auth';
import { storage } from '../services/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SafaLogo } from '../components/ui/SafaLogo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const allUsers = storage.getUsers();
  const activeInvitations = storage.getInvitations().filter(i => i.status === 'pending');

  // Default to the first available administrator.
  const [selectedUserId, setSelectedUserId] = useState<string>(
    allUsers.find(u => u.role === 'super_admin')?.id || allUsers[0]?.id || 'usr-1'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedUser = allUsers.find(u => u.id === selectedUserId) || allUsers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (!password) {
      setError('Please enter the administrator password.');
      return;
    }

    setIsLoading(true);

    // Provide immediate responsive feedback before validating/redirecting
    setTimeout(() => {
      // Password must match the configured administrator access password.
      if (password !== ADMIN_ACCESS_PASSWORD) {
        setError('Incorrect password. Access denied.');
        setIsLoading(false);
        return;
      }

      // Authenticate and grant access
      const res = auth.loginWithPassword(password, selectedUser);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Access denied.');
        setIsLoading(false);
      }
    }, 400);
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
            <span>SAFA Admin Access Gate</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#3D3B36]">
            Administrator Portal
          </h1>
          <p className="text-sm text-[#6D6A61] mt-1.5 max-w-sm mx-auto">
            Authorized personnel only. Please enter the administrator security password to continue.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-[#FDFCF9] shadow-md border border-[#E5E0D5] rounded-3xl">
          {error && (
            <div
              id="admin-login-error"
              className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2.5 animate-shake"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Selector */}
            <div>
              <label
                htmlFor="admin-account-select"
                className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5"
              >
                Enter as Administrator:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#6D6A61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="admin-account-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] font-medium outline-hidden focus:border-[#5E6E52] focus:ring-1 focus:ring-[#5E6E52] cursor-pointer appearance-none"
                >
                  {allUsers.map((u) => {
                    const roleTitle = ROLE_DETAILS[u.role]?.title || u.role;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} — {roleTitle}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6D6A61] text-xs">
                  ▼
                </div>
              </div>
              {selectedUser && (
                <p className="text-[11px] text-[#6D6A61] mt-1.5">
                  Role: <span className="font-semibold text-[#3D3B36]">{ROLE_DETAILS[selectedUser.role]?.title}</span> ({selectedUser.email})
                </p>
              )}
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
                  autoFocus
                  placeholder="Enter administrator password"
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

          {/* Pending Invitations link if applicable */}
          {activeInvitations.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#B06D50]/10 border border-[#B06D50]/20 text-xs text-[#3D3B36]">
              <div className="flex items-center gap-2 font-bold text-[#B06D50] mb-1">
                <UserPlus className="w-4 h-4" />
                <span>Pending Invitation Link</span>
              </div>
              <p className="text-[11px] text-[#6D6A61] mb-1.5">
                Invitation pending for <strong>{activeInvitations[0].name}</strong> ({activeInvitations[0].email}).
              </p>
              <Link
                to={`/admin/invite/${activeInvitations[0].token}`}
                className="inline-flex items-center gap-1 font-semibold text-[#B06D50] hover:underline text-[11px]"
              >
                Test Activation Link →
              </Link>
            </div>
          )}
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
