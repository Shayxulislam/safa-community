import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight, UserPlus, Key } from 'lucide-react';
import { storage } from '../services/storage';
import { auth, ROLE_DETAILS } from '../services/auth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const AdminInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const invitation = token ? storage.getInvitationByToken(token) : undefined;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!invitation) {
    return (
      <div className="py-20 bg-[#F1EDE4] min-h-screen text-[#3D3B36] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3D3B36]">Invalid Invitation Link</h1>
          <p className="text-sm text-[#6D6A61] mt-2 mb-6">
            This invitation token either does not exist or has expired. Please request a new invitation from the SAFA Owner.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin/login')}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="py-20 bg-[#F1EDE4] min-h-screen text-[#3D3B36] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3D3B36]">Invitation Already {invitation.status}</h1>
          <p className="text-sm text-[#6D6A61] mt-2 mb-6">
            This invitation link was already used or revoked on {new Date(invitation.createdAt).toLocaleDateString()}.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin/login')}>
            Sign In with Existing Password
          </Button>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_DETAILS[invitation.role];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = auth.activateInvitation(invitation.token, password);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } else {
      setError(res.error || 'Activation failed');
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-[#F1EDE4] min-h-screen text-[#3D3B36] flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 text-left">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-3">
            <UserPlus className="w-4 h-4" />
            <span>SAFA Team Invitation</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#3D3B36]">
            Welcome, {invitation.name}
          </h1>
          <p className="text-sm text-[#6D6A61] mt-1.5">
            You were invited by <strong>{invitation.invitedByName}</strong> to join SAFA as an administrator.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-[#FDFCF9] shadow-md border border-[#E5E0D5] rounded-3xl">
          {/* Role details */}
          <div className="p-4 rounded-2xl bg-[#F1EDE4]/70 border border-[#E5E0D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">Assigned Role:</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${roleMeta?.badgeColor || 'bg-[#5E6E52] text-white'}`}>
                {roleMeta?.title || invitation.role}
              </span>
            </div>
            <p className="text-xs text-[#3D3B36] leading-relaxed">
              {roleMeta?.description}
            </p>
            <div className="text-[11px] text-[#6D6A61] pt-1 border-t border-[#E5E0D5]">
              Invited account email: <strong className="text-[#3D3B36]">{invitation.email}</strong>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3D3B36]">Account Successfully Activated!</h3>
              <p className="text-xs text-[#6D6A61]">
                Your administrative credentials are set. Redirecting you to the SAFA CMS dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#6D6A61]">
                Please create your secure personal password to complete your account setup. No one else will have access to this password.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Choose New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#6D6A61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52] focus:ring-1 focus:ring-[#5E6E52]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6D6A61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52] focus:ring-1 focus:ring-[#5E6E52]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Activate Account & Enter CMS
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/admin/login"
            className="text-xs text-[#6D6A61] hover:text-[#3D3B36] hover:underline"
          >
            ← Already have an activated account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
