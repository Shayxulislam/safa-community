import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { auth } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AdminPasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const isOwner = auth.getCurrentUser()?.role === 'super_admin';
  const [targetType, setTargetType] = useState<'owner' | 'admin'>(isOwner ? 'owner' : 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setError(''); setMessage('');
    if (newPassword !== confirmation) { setError('New passwords do not match.'); return; }
    setBusy(true);
    try {
      const result = await auth.changePassword(currentPassword, newPassword, confirmation, targetType);
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      if (result.signedOut) navigate(auth.getSignInPath(), { replace: true });
      else setMessage('Admin password changed. All Admin sessions have ended. You are still signed in as Owner.');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not change password.'); }
    finally { setBusy(false); }
  };
  const input = 'w-full border border-[#E5E0D5] rounded-xl bg-white p-3 text-sm focus:ring-2 focus:ring-blue-600';
  return <Card className="p-6 max-w-xl space-y-5 border border-[#E5E0D5]">
    <div><h1 className="text-2xl font-serif font-bold">Security</h1><h2 className="text-lg mt-3 font-semibold flex items-center gap-2"><KeyRound className="w-5 h-5" />Change password</h2>
      <p className="text-sm text-[#6D6A61] mt-2">{isOwner ? 'Owner can change either password. Confirm with your current Owner password.' : 'Change the Admin password using the current Admin password.'} All sessions for the selected type will end. Use 10–128 characters and different passwords for Owner and Admin.</p></div>
    {error && <p role="alert" className="rounded-xl p-3 bg-red-50 text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-xl p-3 bg-green-50 text-green-800">{message}</p>}
    <form className="space-y-4" onSubmit={submit}>
      <div><label htmlFor="password-target" className="block text-sm font-semibold mb-1">Password to change</label>
        <select id="password-target" value={targetType} disabled={busy || !isOwner} className={input} onChange={event => { setTargetType(event.target.value as 'owner' | 'admin'); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setMessage(''); setError(''); }}>
          {isOwner && <option value="owner">Owner</option>}<option value="admin">Admin</option>
        </select></div>
      {[
        {id:'current-admin-password', label:isOwner ? 'Current Owner password' : 'Current Admin password', value:currentPassword, set:setCurrentPassword, current:true},
        {id:'new-admin-password', label:'New password', value:newPassword, set:setNewPassword, current:false},
        {id:'confirm-admin-password', label:'Confirm new password', value:confirmation, set:setConfirmation, current:false}
      ].map(field => <div key={field.id}><label htmlFor={field.id} className="block text-sm font-semibold mb-1">{field.label}</label><input id={field.id} className={input} type={visible ? 'text' : 'password'} autoComplete={field.current ? 'current-password' : 'new-password'} minLength={field.current ? undefined : 10} maxLength={128} value={field.value} onChange={event => field.set(event.target.value)} disabled={busy} required /></div>)}
      <div className="flex flex-wrap justify-between items-center gap-3"><button type="button" onClick={() => setVisible(value => !value)} aria-pressed={visible} className="flex gap-2 items-center text-sm">{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{visible ? 'Hide passwords' : 'Show passwords'}</button><Button type="submit" disabled={busy}>{busy ? 'Changing password…' : 'Change password'}</Button></div>
    </form>
  </Card>;
};
