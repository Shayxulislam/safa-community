import { User, UserRole, PermissionKey, AdminInvitation } from '../types';
import { storage } from './storage';

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; group: string; description: string }[] = [
  // Content
  { key: 'content.create', label: 'Create Content', group: 'Content & Articles', description: 'Create drafts of articles, stories, announcements' },
  { key: 'content.edit', label: 'Edit Content', group: 'Content & Articles', description: 'Edit own or team drafts' },
  { key: 'content.review', label: 'Review Content', group: 'Content & Articles', description: 'Review, comment on, and reject/approve submitted content' },
  { key: 'content.publish', label: 'Publish Content', group: 'Content & Articles', description: 'Publish articles and announcements publicly' },
  { key: 'content.delete', label: 'Delete Content', group: 'Content & Articles', description: 'Delete articles and stories' },

  // Work Projects
  { key: 'work.create', label: 'Create Projects', group: 'Piece of Our Work', description: 'Create new field work records' },
  { key: 'work.edit', label: 'Edit Projects', group: 'Piece of Our Work', description: 'Update project descriptions and media' },
  { key: 'work.publish', label: 'Publish & Verify Projects', group: 'Piece of Our Work', description: 'Mark projects as verified and publish publicly' },
  { key: 'work.archive', label: 'Archive Projects', group: 'Piece of Our Work', description: 'Archive or remove work projects' },

  // Media
  { key: 'media.upload', label: 'Upload Media', group: 'Media & Gallery', description: 'Upload photos, videos, albums, and documents' },
  { key: 'media.edit', label: 'Edit Media', group: 'Media & Gallery', description: 'Edit captions, tags, and album details' },
  { key: 'media.delete', label: 'Delete Media', group: 'Media & Gallery', description: 'Delete items from media library' },

  // Stories
  { key: 'stories.create', label: 'Create Stories', group: 'Human Stories', description: 'Write human impact stories' },
  { key: 'stories.edit', label: 'Edit Stories', group: 'Human Stories', description: 'Edit story drafts' },
  { key: 'stories.publish', label: 'Publish Stories', group: 'Human Stories', description: 'Publish verified stories' },

  // Reports
  { key: 'reports.create', label: 'Upload Reports', group: 'Transparency & Reports', description: 'Upload annual/financial PDFs' },
  { key: 'reports.publish', label: 'Publish Reports', group: 'Transparency & Reports', description: 'Release public transparency reports' },

  // Contributions & Finance
  { key: 'contributions.view', label: 'View Contributions', group: 'Finance & Ledger', description: 'View public and private contribution records' },
  { key: 'contributions.manage', label: 'Manage Contributions', group: 'Finance & Ledger', description: 'Reconcile transfers and issue references' },

  // Volunteers & Messages
  { key: 'volunteers.view', label: 'View Volunteers', group: 'Volunteers & Community', description: 'View incoming volunteer applications' },
  { key: 'volunteers.manage', label: 'Manage Volunteers', group: 'Volunteers & Community', description: 'Change status, approve, and contact volunteers' },
  { key: 'messages.view', label: 'View Inquiries', group: 'Contact & Messages', description: 'View contact form messages' },
  { key: 'messages.manage', label: 'Manage Inquiries', group: 'Contact & Messages', description: 'Resolve and archive inquiries' },

  // Team & Administration
  { key: 'admins.create', label: 'Invite Administrators', group: 'Team & Security', description: 'Invite new administrators and assign roles' },
  { key: 'admins.edit', label: 'Edit Administrators', group: 'Team & Security', description: 'Modify roles, permissions, or disable accounts' },
  { key: 'admins.delete', label: 'Remove Administrators', group: 'Team & Security', description: 'Permanently remove administrator accounts' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Team & Security', description: 'Configure bank details, founder info, and site settings' }
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  super_admin: {
    'content.create': true,
    'content.edit': true,
    'content.review': true,
    'content.publish': true,
    'content.delete': true,
    'work.create': true,
    'work.edit': true,
    'work.publish': true,
    'work.archive': true,
    'media.upload': true,
    'media.edit': true,
    'media.delete': true,
    'stories.create': true,
    'stories.edit': true,
    'stories.publish': true,
    'reports.create': true,
    'reports.publish': true,
    'contributions.view': true,
    'contributions.manage': true,
    'volunteers.view': true,
    'volunteers.manage': true,
    'messages.view': true,
    'messages.manage': true,
    'admins.create': true,
    'admins.edit': true,
    'admins.delete': true,
    'settings.manage': true
  },
  admin: {
    'content.create': true,
    'content.edit': true,
    'content.review': true,
    'content.publish': true,
    'content.delete': true,
    'work.create': true,
    'work.edit': true,
    'work.publish': true,
    'work.archive': true,
    'media.upload': true,
    'media.edit': true,
    'media.delete': true,
    'stories.create': true,
    'stories.edit': true,
    'stories.publish': true,
    'reports.create': true,
    'reports.publish': true,
    'contributions.view': true,
    'contributions.manage': true,
    'volunteers.view': true,
    'volunteers.manage': true,
    'messages.view': true,
    'messages.manage': true,
    'admins.create': true,
    'admins.edit': true,
    'admins.delete': false, // only super_admin can permanently delete admins
    'settings.manage': true
  },
  content_manager: {
    'content.create': true,
    'content.edit': true,
    'content.review': false,
    'content.publish': false, // must submit for review
    'content.delete': false,
    'work.create': true,
    'work.edit': true,
    'work.publish': false,
    'work.archive': false,
    'media.upload': true,
    'media.edit': true,
    'media.delete': false,
    'stories.create': true,
    'stories.edit': true,
    'stories.publish': false,
    'reports.create': false,
    'reports.publish': false,
    'contributions.view': false,
    'contributions.manage': false,
    'volunteers.view': false,
    'volunteers.manage': false,
    'messages.view': false,
    'messages.manage': false,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': false
  },
  media_manager: {
    'content.create': false,
    'content.edit': false,
    'content.review': false,
    'content.publish': false,
    'content.delete': false,
    'work.create': false,
    'work.edit': false,
    'work.publish': false,
    'work.archive': false,
    'media.upload': true,
    'media.edit': true,
    'media.delete': true,
    'stories.create': false,
    'stories.edit': false,
    'stories.publish': false,
    'reports.create': false,
    'reports.publish': false,
    'contributions.view': false,
    'contributions.manage': false,
    'volunteers.view': false,
    'volunteers.manage': false,
    'messages.view': false,
    'messages.manage': false,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': false
  },
  editor: {
    'content.create': true,
    'content.edit': true,
    'content.review': true,
    'content.publish': true,
    'content.delete': true,
    'work.create': true,
    'work.edit': true,
    'work.publish': true,
    'work.archive': false,
    'media.upload': true,
    'media.edit': true,
    'media.delete': false,
    'stories.create': true,
    'stories.edit': true,
    'stories.publish': true,
    'reports.create': true,
    'reports.publish': true,
    'contributions.view': false,
    'contributions.manage': false,
    'volunteers.view': false,
    'volunteers.manage': false,
    'messages.view': false,
    'messages.manage': false,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': false
  },
  finance: {
    'content.create': false,
    'content.edit': false,
    'content.review': false,
    'content.publish': false,
    'content.delete': false,
    'work.create': false,
    'work.edit': false,
    'work.publish': false,
    'work.archive': false,
    'media.upload': false,
    'media.edit': false,
    'media.delete': false,
    'stories.create': false,
    'stories.edit': false,
    'stories.publish': false,
    'reports.create': true,
    'reports.publish': true,
    'contributions.view': true,
    'contributions.manage': true,
    'volunteers.view': false,
    'volunteers.manage': false,
    'messages.view': false,
    'messages.manage': false,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': true // bank accounts
  },
  volunteer_manager: {
    'content.create': false,
    'content.edit': false,
    'content.review': false,
    'content.publish': false,
    'content.delete': false,
    'work.create': false,
    'work.edit': false,
    'work.publish': false,
    'work.archive': false,
    'media.upload': false,
    'media.edit': false,
    'media.delete': false,
    'stories.create': false,
    'stories.edit': false,
    'stories.publish': false,
    'reports.create': false,
    'reports.publish': false,
    'contributions.view': false,
    'contributions.manage': false,
    'volunteers.view': true,
    'volunteers.manage': true,
    'messages.view': true,
    'messages.manage': true,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': false
  },
  viewer: {
    'content.create': false,
    'content.edit': false,
    'content.review': false,
    'content.publish': false,
    'content.delete': false,
    'work.create': false,
    'work.edit': false,
    'work.publish': false,
    'work.archive': false,
    'media.upload': false,
    'media.edit': false,
    'media.delete': false,
    'stories.create': false,
    'stories.edit': false,
    'stories.publish': false,
    'reports.create': false,
    'reports.publish': false,
    'contributions.view': true,
    'contributions.manage': false,
    'volunteers.view': true,
    'volunteers.manage': false,
    'messages.view': true,
    'messages.manage': false,
    'admins.create': false,
    'admins.edit': false,
    'admins.delete': false,
    'settings.manage': false
  }
};

export const ROLE_DETAILS: Record<UserRole, { title: string; badgeColor: string; description: string }> = {
  super_admin: {
    title: 'Super Admin / Owner',
    badgeColor: 'bg-[#5E6E52] text-white',
    description: 'Full organizational control, manage administrators, finance, and system settings.'
  },
  admin: {
    title: 'Administrator',
    badgeColor: 'bg-[#3D3B36] text-white',
    description: 'Broad management across content, projects, volunteers, and reporting.'
  },
  content_manager: {
    title: 'Content Manager',
    badgeColor: 'bg-[#B06D50] text-white',
    description: 'Creates articles, project drafts, and stories. Submits for review before publishing.'
  },
  media_manager: {
    title: 'Media Manager',
    badgeColor: 'bg-[#2E5E4E] text-white',
    description: 'Uploads and organizes photos, videos, and galleries.'
  },
  editor: {
    title: 'Editorial Lead',
    badgeColor: 'bg-[#5A4A78] text-white',
    description: 'Reviews pending drafts, approves, rejects with feedback, and publishes content.'
  },
  finance: {
    title: 'Finance & Audit Manager',
    badgeColor: 'bg-[#846340] text-white',
    description: 'Reconciles public contributions, generates statements, and oversees bank configs.'
  },
  volunteer_manager: {
    title: 'Volunteer Coordinator',
    badgeColor: 'bg-[#3B657A] text-white',
    description: 'Interviews, reviews, and manages community volunteer applications.'
  },
  viewer: {
    title: 'Staff Viewer',
    badgeColor: 'bg-[#6D6A61] text-white',
    description: 'Read-only visibility for reporting and organizational audits.'
  }
};

export const ADMIN_ACCESS_PASSWORD = 'NargizaSAFA!';

export const auth = {
  getUsers(): User[] {
    return storage.getUsers();
  },

  getCurrentUser(): User | null {
    return storage.getCurrentUser();
  },

  verifyAdminPassword(password: string): boolean {
    return password === ADMIN_ACCESS_PASSWORD;
  },

  loginWithPassword(password: string, userOrId?: string | User): { success: boolean; user?: User; error?: string } {
    if (password !== ADMIN_ACCESS_PASSWORD) {
      return {
        success: false,
        error: 'Incorrect password. Access denied.'
      };
    }

    let targetUser: User | undefined;
    if (userOrId && typeof userOrId === 'object') {
      targetUser = userOrId;
    } else if (typeof userOrId === 'string' && userOrId.trim()) {
      const query = userOrId.trim().toLowerCase();
      targetUser = storage.getUsers().find(u => u.id === query || u.email.toLowerCase() === query);
    }

    // Default to the first available administrator if no user is specified.
    if (!targetUser) {
      targetUser = storage.getUsers().find(u => u.role === 'super_admin') || storage.getUsers()[0];
    }

    if (!targetUser) {
      return { success: false, error: 'Administrator profile not found.' };
    }

    if (targetUser.status === 'disabled') {
      return { success: false, error: 'This administrator account has been disabled.' };
    }

    const updatedUser = { ...targetUser, lastLoginAt: new Date().toISOString() };
    storage.setCurrentUser(updatedUser);
    storage.setAdminUnlocked(true);
    storage.updateUser(updatedUser.id, { lastLoginAt: updatedUser.lastLoginAt });
    storage.addAuditLog('Admin Access Granted', 'Auth', `Authorized with password as ${updatedUser.name} (${updatedUser.role})`, updatedUser.name);
    return { success: true, user: updatedUser };
  },

  isAdminUnlocked(): boolean {
    return storage.isAdminUnlocked();
  },

  hasPermission(permission: PermissionKey, targetUser?: User | null): boolean {
    const user = targetUser !== undefined ? targetUser : this.getCurrentUser();
    if (!user) return false;
    if (user.status === 'disabled') return false;

    // Check custom override first
    if (user.customPermissions && user.customPermissions[permission] !== undefined) {
      return !!user.customPermissions[permission];
    }

    // Role default
    const roleDefaults = ROLE_DEFAULT_PERMISSIONS[user.role];
    if (!roleDefaults) return false;
    return !!roleDefaults[permission];
  },

  getUserEffectivePermissions(user: User): Record<PermissionKey, boolean> {
    const base = { ...ROLE_DEFAULT_PERMISSIONS[user.role] };
    if (user.customPermissions) {
      Object.entries(user.customPermissions).forEach(([k, v]) => {
        if (v !== undefined) {
          base[k as PermissionKey] = v;
        }
      });
    }
    return base;
  },

  login(userOrEmail: string | User): { success: boolean; user?: User; error?: string } {
    if (typeof userOrEmail === 'object') {
      if (userOrEmail.status === 'disabled') {
        return { success: false, error: 'This administrator account has been disabled by the owner.' };
      }
      const updatedUser = { ...userOrEmail, lastLoginAt: new Date().toISOString() };
      storage.setCurrentUser(updatedUser);
      storage.updateUser(updatedUser.id, { lastLoginAt: updatedUser.lastLoginAt });
      storage.addAuditLog('Admin Login', 'Auth', `Logged in as ${updatedUser.name} (${updatedUser.role})`, updatedUser.name);
      return { success: true, user: updatedUser };
    }

    const email = userOrEmail.trim().toLowerCase();
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      return { success: false, error: 'No administrator account found with this email.' };
    }

    if (user.status === 'disabled') {
      return { success: false, error: 'This account has been disabled. Please contact the SAFA owner.' };
    }

    const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
    storage.setCurrentUser(updatedUser);
    storage.updateUser(user.id, { lastLoginAt: updatedUser.lastLoginAt });
    storage.addAuditLog('Admin Login', 'Auth', `Logged in as ${user.name} (${user.role})`, user.name);
    return { success: true, user: updatedUser };
  },

  logout(): void {
    const current = storage.getCurrentUser();
    if (current) {
      storage.addAuditLog('Admin Logout', 'Auth', `Administrator ${current.name} signed out`, current.name);
    }
    storage.setCurrentUser(null);
    storage.setAdminUnlocked(false);
  },

  isAuthenticated(): boolean {
    const user = storage.getCurrentUser();
    const unlocked = storage.isAdminUnlocked();
    return !!user && user.status === 'active' && unlocked;
  },

  // Invitation Activation
  activateInvitation(token: string, newPassword: string): { success: boolean; user?: User; error?: string } {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const invitation = storage.getInvitationByToken(token);
    if (!invitation) {
      return { success: false, error: 'Invalid or expired invitation link.' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: `This invitation has already been ${invitation.status}.` };
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      storage.updateInvitationStatus(invitation.id, 'expired');
      return { success: false, error: 'This invitation token has expired. Please ask the owner for a new link.' };
    }

    // Create the activated admin user
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      status: 'active',
      customPermissions: invitation.customPermissions,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      invitedBy: invitation.invitedByName
    };

    storage.addUser(newUser);
    storage.updateInvitationStatus(invitation.id, 'accepted');
    storage.setCurrentUser(newUser);
    storage.setAdminUnlocked(true);
    storage.addAuditLog('Activated Admin Account', 'User', `Admin ${newUser.name} created credentials and activated account`, newUser.name);

    return { success: true, user: newUser };
  }
};
