import React, { useState } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Edit2,
  Copy,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  Key,
  Mail,
  User as UserIcon,
  Filter,
  Lock
} from 'lucide-react';
import { User, UserRole, PermissionKey, AdminInvitation } from '../../types';
import { storage } from '../../services/storage';
import { auth, ROLE_DETAILS, ALL_PERMISSIONS } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AdminTeamTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminTeamTab: React.FC<AdminTeamTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const users = storage.getUsers();
  const invitations = storage.getInvitations();

  // Invite Admin Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('content_manager');
  const [customPerms, setCustomPerms] = useState<Partial<Record<PermissionKey, boolean>>>({});
  const [generatedInvite, setGeneratedInvite] = useState<AdminInvitation | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Edit Admin Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('editor');
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active');
  const [editPerms, setEditPerms] = useState<Partial<Record<PermissionKey, boolean>>>({});

  // Feedback notice
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // If not super admin, display restricted notice
  if (!isSuperAdmin) {
    return (
      <Card className="p-8 text-center bg-white rounded-3xl border border-[#E5E0D5] max-w-lg mx-auto my-12 text-[#3D3B36]">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-xl text-[#3D3B36]">Owner-Restricted Section</h3>
        <p className="text-xs text-[#6D6A61] mt-2 mb-4 leading-relaxed">
          The Team & Administrator Management panel is strictly restricted to the <strong>SAFA Owner / Super Admin</strong> role. Authorized administrators can manage team access here.
        </p>
      </Card>
    );
  }

  // Handle invitation creation
  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newInv = storage.createInvitation({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      customPermissions: Object.keys(customPerms).length > 0 ? customPerms : undefined,
      invitedBy: currentUser.id,
      invitedByName: currentUser.name
    });

    setGeneratedInvite(newInv);
    onRefresh();
    showNotice(`Invitation created for ${newInv.name} (${newInv.role})!`);
  };

  const copyInviteLink = (token: string) => {
    const fullUrl = `${window.location.origin}/admin/invite/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
    showNotice('Invitation activation link copied to clipboard!');
  };

  // Handle User Edit save
  const handleSaveUserEdit = () => {
    if (!editingUser) return;

    storage.updateUser(
      editingUser.id,
      {
        role: editRole,
        status: editStatus,
        customPermissions: editPerms
      },
      currentUser.name
    );

    setEditingUser(null);
    onRefresh();
    showNotice(`Updated administrator profile for ${editingUser.name}`);
  };

  // Handle User Deletion
  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own active administrator account!');
      return;
    }
    if (confirm(`Are you sure you want to permanently revoke administrator access for ${user.name}?`)) {
      storage.deleteUser(user.id, currentUser.name);
      onRefresh();
      showNotice(`Administrator ${user.name} removed from the system.`);
    }
  };

  // Handle Revoke Invitation
  const handleRevokeInvite = (inv: AdminInvitation) => {
    if (confirm(`Revoke invitation for ${inv.name} (${inv.email})?`)) {
      storage.revokeInvitation(inv.id, currentUser.name);
      onRefresh();
      showNotice(`Invitation for ${inv.email} revoked.`);
    }
  };

  const availableRoles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: 'super_admin',
      title: 'Super Admin (Owner)',
      desc: 'Complete control: add/remove admins, assign permissions, audit logs, publish directly.'
    },
    {
      role: 'content_manager',
      title: 'Content Manager',
      desc: 'Creates and drafts articles, field projects, and announcements. Follows draft/review workflow.'
    },
    {
      role: 'media_manager',
      title: 'Media Manager',
      desc: 'Manages field photo archives, video uploads, and community media libraries.'
    },
    {
      role: 'editor',
      title: 'Lead Editor',
      desc: 'Reviews submitted content from Content Managers. Can approve, reject with notes, or publish directly.'
    },
    {
      role: 'finance',
      title: 'Finance Officer',
      desc: 'Reconciles bank transfers, ledger transactions, and transparency audit reports.'
    },
    {
      role: 'volunteer_manager',
      title: 'Volunteer Coordinator',
      desc: 'Reviews incoming volunteer applications and coordinates community inquiries.'
    },
    {
      role: 'viewer',
      title: 'Auditor / Viewer',
      desc: 'Read-only access to drafts, logs, and internal metrics.'
    }
  ];

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>SAFA Owner Control Center</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Administrator Roster & Access Management
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            As SAFA Owner, you can invite new administrators, designate roles, configure fine-grained permissions, and audit all platform activity.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setGeneratedInvite(null);
            setInviteName('');
            setInviteEmail('');
            setInviteRole('content_manager');
            setCustomPerms({});
            setIsInviteModalOpen(true);
          }}
          icon={<UserPlus className="w-4 h-4" />}
          className="shrink-0"
        >
          + Add Administrator
        </Button>
      </div>

      {/* Active Administrators Roster */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
              Active Administrators ({users.length})
            </h3>
            <p className="text-xs text-[#6D6A61]">
              Team members currently authorized to access the SAFA CMS
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E5E0D5] text-[#6D6A61] uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Role & Duties</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Added Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {users.map(user => {
                const roleMeta = ROLE_DETAILS[user.role] || {
                  title: user.role,
                  badgeColor: 'bg-gray-600 text-white',
                  description: ''
                };
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-[#FDFCF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.role === 'super_admin' ? (
                          <img
                            src="/ceo.png"
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover object-top border border-[#E5E0D5]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#F1EDE4] border border-[#E5E0D5] flex items-center justify-center font-bold text-sm text-[#5E6E52]">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-[#3D3B36] flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#5E6E52]/10 text-[#5E6E52] font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6D6A61]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${roleMeta.badgeColor}`}>
                          {roleMeta.title}
                        </span>
                        <p className="text-[11px] text-[#6D6A61] max-w-xs line-clamp-1">
                          {roleMeta.description}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        user.status === 'disabled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'disabled' ? 'bg-red-500' : 'bg-green-500'}`} />
                        {user.status === 'disabled' ? 'Disabled' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#6D6A61] text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditRole(user.role);
                            setEditStatus(user.status || 'active');
                            setEditPerms(user.customPermissions || {});
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#F1EDE4] text-[#6D6A61] hover:text-[#3D3B36]"
                          title="Edit Role & Permissions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#6D6A61] hover:text-red-700"
                            title="Remove Administrator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Invitations Section */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
              Admin Invitations ({invitations.length})
            </h3>
            <p className="text-xs text-[#6D6A61]">
              Tokenized, secure activation links issued by the SAFA Owner
            </p>
          </div>
        </div>

        {invitations.length === 0 ? (
          <p className="text-xs text-[#6D6A61] py-4 text-center">No invitations issued yet.</p>
        ) : (
          <div className="space-y-3">
            {invitations.map(inv => {
              const isPending = inv.status === 'pending';
              const roleMeta = ROLE_DETAILS[inv.role];

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isPending
                      ? 'bg-[#FDFCF9] border-[#E5E0D5]'
                      : 'bg-[#F1EDE4]/40 border-stone-200 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3D3B36]">{inv.name}</span>
                      <span className="text-[#6D6A61]">({inv.email})</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${roleMeta?.badgeColor || 'bg-gray-600 text-white'}`}>
                        {roleMeta?.title || inv.role}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                        inv.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : inv.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6D6A61] flex items-center gap-3">
                      <span>Invited by: {inv.invitedByName}</span>
                      <span>• Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                      {isPending && <span>• Expires: in 48 hours</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInviteLink(inv.token)}
                          icon={<Copy className="w-3.5 h-3.5" />}
                        >
                          Copy Activation Link
                        </Button>
                        <button
                          onClick={() => handleRevokeInvite(inv)}
                          className="text-xs text-red-600 hover:underline px-2 py-1"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ADD ADMINISTRATOR MODAL */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Administrator"
      >
        <div className="space-y-5 text-left text-xs">
          {generatedInvite ? (
            <div className="space-y-4 p-4 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20">
              <div className="flex items-center gap-2 font-bold text-[#5E6E52] text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Invitation Issued Successfully!</span>
              </div>
              <p className="text-xs text-[#3D3B36] leading-relaxed">
                An invitation token has been minted for <strong>{generatedInvite.name}</strong> ({generatedInvite.email}) with role <strong>{ROLE_DETAILS[generatedInvite.role]?.title}</strong>.
              </p>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D5] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61]">Single-Use Activation URL:</span>
                <div className="p-2 rounded-lg bg-[#F1EDE4] font-mono text-[11px] text-[#3D3B36] break-all select-all">
                  {`${window.location.origin}/admin/invite/${generatedInvite.token}`}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => copyInviteLink(generatedInvite.token)}
                  icon={copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedToken ? 'Link Copied to Clipboard!' : 'Copy Activation Link'}
                </Button>
              </div>

              <p className="text-[11px] text-[#6D6A61]">
                Send this link to the team member. When they visit it, they will choose their personal password and immediately join the administrative portal.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasur Karimov"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jasur@safa.uz"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Administrative Role
                </label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
                >
                  {availableRoles.map(r => (
                    <option key={r.role} value={r.role}>
                      {r.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#6D6A61] mt-1.5 leading-relaxed">
                  {availableRoles.find(r => r.role === inviteRole)?.desc}
                </p>
              </div>

              {/* Fine-grained Custom Permissions Checklist */}
              <div className="p-3.5 rounded-2xl bg-[#F1EDE4]/60 border border-[#E5E0D5] space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D3B36]">
                  Custom Permission Overrides (Optional):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map(p => {
                    const isChecked = customPerms[p.key] ?? false;
                    return (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E0D5] cursor-pointer hover:bg-[#FDFCF9]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            setCustomPerms({
                              ...customPerms,
                              [p.key]: e.target.checked
                            });
                          }}
                          className="rounded text-[#5E6E52] focus:ring-[#5E6E52]"
                        />
                        <span className="text-[11px] text-[#3D3B36] font-medium">{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Issue Invitation Token
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* EDIT ADMINISTRATOR MODAL */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit ${editingUser.name}` : ''}
      >
        {editingUser && (
          <div className="space-y-4 text-left text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Assigned Role
              </label>
              <select
                value={editRole}
                onChange={e => setEditRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                {availableRoles.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#6D6A61] mt-1.5 leading-relaxed">
                {availableRoles.find(r => r.role === editRole)?.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Account Status
              </label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'active' | 'disabled')}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="active">Active (Access Allowed)</option>
                <option value="disabled">Disabled (Access Blocked)</option>
              </select>
            </div>

            {/* Custom permission checkboxes */}
            <div className="p-3.5 rounded-2xl bg-[#F1EDE4]/60 border border-[#E5E0D5] space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D3B36]">
                Granular Permissions:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.map(p => {
                  const isChecked = editPerms[p.key] ?? false;
                  return (
                    <label
                      key={p.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E0D5] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          setEditPerms({
                            ...editPerms,
                            [p.key]: e.target.checked
                          });
                        }}
                        className="rounded text-[#5E6E52] focus:ring-[#5E6E52]"
                      />
                      <span className="text-[11px] text-[#3D3B36] font-medium">{p.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveUserEdit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
