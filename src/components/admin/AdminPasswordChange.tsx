import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { auth } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AdminPasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      await auth.changePassword(currentPassword, newPassword, confirmPassword);
      setMessage({ type: 'success', text: 'Password changed. Sign in again with your new password.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => navigate('/admin/login'), 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Password could not be changed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 pr-10 border rounded-xl border-[#E5E0D5] bg-white text-sm text-[#3D3B36] focus:border-[#5E6E52] focus:outline-hidden focus:ring-1 focus:ring-[#5E6E52]';

  return (
    <Card className="p-6 bg-white border border-[#E5E0D5] rounded-2xl shadow-2xs space-y-4">
      <div>
        <h2 className="font-serif font-bold text-lg text-[#3D3B36] flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#5E6E52]" />
          Change password
        </h2>
        <p className="text-xs text-[#6D6A61] mt-1">Use your current password to set a new password for this account.</p>
      </div>

      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { id: 'current-admin-password', label: 'Current password', value: currentPassword, setValue: setCurrentPassword, autoComplete: 'current-password' },
          { id: 'new-admin-password', label: 'New password', value: newPassword, setValue: setNewPassword, autoComplete: 'new-password' },
          { id: 'confirm-admin-password', label: 'Confirm new password', value: confirmPassword, setValue: setConfirmPassword, autoComplete: 'new-password' }
        ].map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-xs font-semibold text-[#3D3B36] mb-1">{field.label}</label>
            <div className="relative">
              <input
                id={field.id}
                type={showPasswords ? 'text' : 'password'}
                autoComplete={field.autoComplete}
                required
                minLength={field.id === 'current-admin-password' ? undefined : 8}
                maxLength={256}
                value={field.value}
                onChange={event => field.setValue(event.target.value)}
                className={inputClass}
              />
              {field.id === 'current-admin-password' && (
                <button
                  type="button"
                  onClick={() => setShowPasswords(value => !value)}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  title={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6D6A61] hover:text-[#3D3B36]"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end pt-1">
          <Button type="submit" variant="primary" size="sm" disabled={isLoading} icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}>
            {isLoading ? 'Changing password...' : 'Change password'}
          </Button>
        </div>
      </form>
    </Card>
  );
};