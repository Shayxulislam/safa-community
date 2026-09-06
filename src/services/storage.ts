import {
  FounderProfile,
  SocialLink,
  ImpactStatistic,
  Program,
  WorkItem,
  Story,
  HistoryEntry,
  Contribution,
  TransparencyReport,
  DonationBankConfig,
  VolunteerApplication,
  ContactMessage,
  AuditLog,
  User,
  UserRole,
  Article,
  VideoItem,
  PhotoAlbum,
  MediaAsset,
  Announcement,
  AdminInvitation,
  ContentWorkflowStatus,
  EventItem,
  DonationCampaign
} from '../types';
import {
  INITIAL_FOUNDER_PROFILE,
  INITIAL_SOCIAL_LINKS,
  INITIAL_IMPACT_STATS,
  INITIAL_PROGRAMS,
  INITIAL_WORK_ITEMS,
  INITIAL_STORIES,
  INITIAL_HISTORY_TIMELINE,
  INITIAL_CONTRIBUTIONS,
  INITIAL_TRANSPARENCY_REPORTS,
  INITIAL_BANK_CONFIG,
  INITIAL_USERS,
  INITIAL_INVITATIONS,
  INITIAL_ARTICLES,
  INITIAL_VIDEOS,
  INITIAL_PHOTO_ALBUMS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_DONATION_CAMPAIGNS
} from '../data/seedData';

const KEYS = {
  FOUNDER: 'safa_founder_profile',
  SOCIALS: 'safa_social_links',
  STATS: 'safa_impact_stats',
  PROGRAMS: 'safa_programs',
  WORK_ITEMS: 'safa_work_items',
  STORIES: 'safa_stories',
  HISTORY: 'safa_history',
  CONTRIBUTIONS: 'safa_contributions',
  REPORTS: 'safa_reports',
  BANK: 'safa_bank_config',
  VOLUNTEERS: 'safa_volunteers',
  CONTACTS: 'safa_contacts',
  AUDIT: 'safa_audit_logs',
  CURRENT_USER: 'safa_current_user',
  USERS: 'safa_admin_users',
  INVITATIONS: 'safa_admin_invitations',
  ARTICLES: 'safa_articles',
  VIDEOS: 'safa_videos',
  PHOTO_ALBUMS: 'safa_photo_albums',
  MEDIA: 'safa_media_assets',
  ANNOUNCEMENTS: 'safa_announcements',
  EVENTS: 'safa_events',
  CAMPAIGNS: 'safa_donation_campaigns',
  ADMIN_UNLOCKED: 'safa_admin_unlocked'
};

function removeLegacySeedContent(): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem('safa_content_migrated_v2') === 'true') return;

  const legacyMarkers: Record<string, string[]> = {
    [KEYS.FOUNDER]: ['Nargiza', '/nargiza_ceo.jpg', '/founder_nargiza.jpg'],
    [KEYS.STATS]: ['1,100+', '160+'],
    [KEYS.PROGRAMS]: ['prog-disability', '280+ individuals'],
    [KEYS.WORK_ITEMS]: ['work-1', '18500000'],
    [KEYS.STORIES]: ['story-1', 'Bobur aka'],
    [KEYS.HISTORY]: ['hist-1', '1,100'],
    [KEYS.CONTRIBUTIONS]: ['c-1001', '1500000'],
    [KEYS.REPORTS]: ['rep-1', 'winter-warmth-2026.pdf'],
    [KEYS.BANK]: ['CONFIRM WITH SAFA BOARD'],
    [KEYS.VOLUNTEERS]: ['vol-1', 'Kamola Saidova'],
    [KEYS.CONTACTS]: ['msg-1', 'Sardor Mirzayev'],
    [KEYS.AUDIT]: ['aud-1', 'Verified Project and Published Work'],
    [KEYS.ARTICLES]: ['art-1', 'safa-community-visit-tashkent-winter'],
    [KEYS.VIDEOS]: ['vid-1', 'Winter Warmth Drive 2026'],
    [KEYS.PHOTO_ALBUMS]: ['alb-1', 'Winter Relief Drive'],
    [KEYS.MEDIA]: ['med-1', 'winter-warmth-hero.jpg'],
    [KEYS.ANNOUNCEMENTS]: ['ann-1', 'Spring Navruz 2026'],
    [KEYS.EVENTS]: ['evt-1', 'navruz-community-grocery-drive-2026'],
    [KEYS.CAMPAIGNS]: ['camp-1', '38400000']
  };

  Object.entries(legacyMarkers).forEach(([key, markers]) => {
    const value = localStorage.getItem(key);
    if (value && markers.some(marker => value.includes(marker))) {
      localStorage.removeItem(key);
    }
  });

  localStorage.setItem('safa_content_migrated_v2', 'true');
}

removeLegacySeedContent();

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

class StorageService {
  // ==========================================
  // USERS & ADMINISTRATOR ACCOUNTS
  // ==========================================
  getUsers(): User[] {
    return getLocal(KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(user: User, actor = 'Super Admin'): void {
    const list = this.getUsers();
    list.push(user);
    setLocal(KEYS.USERS, list);
    this.addAuditLog('Created Admin Account', 'User', `Added administrator ${user.name} (${user.role})`, actor, user.id);
  }

  updateUser(id: string, updates: Partial<User>, actor = 'Admin'): void {
    const list = this.getUsers().map(u => (u.id === id ? { ...u, ...updates } : u));
    setLocal(KEYS.USERS, list);
    // If current logged-in user was updated, sync session
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser({ ...current, ...updates });
    }
    this.addAuditLog(`Updated Admin Account (${id})`, 'User', `Updated attributes: ${Object.keys(updates).join(', ')}`, actor, id);
  }

  deleteUser(id: string, actor = 'Super Admin'): void {
    const list = this.getUsers().filter(u => u.id !== id);
    setLocal(KEYS.USERS, list);
    this.addAuditLog('Removed Administrator', 'User', `Permanently removed admin account ${id}`, actor, id);
  }

  // ==========================================
  // INVITATIONS
  // ==========================================
  getInvitations(): AdminInvitation[] {
    return getLocal(KEYS.INVITATIONS, INITIAL_INVITATIONS);
  }

  getInvitationByToken(token: string): AdminInvitation | undefined {
    return this.getInvitations().find(i => i.token === token);
  }

  createInvitation(data: {
    name: string;
    email: string;
    role: UserRole;
    customPermissions?: Partial<Record<any, boolean>>;
    invitedBy: string;
    invitedByName: string;
  }): AdminInvitation {
    const token = `safa-invite-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    const newInv: AdminInvitation = {
      id: `inv-${Date.now()}`,
      token,
      name: data.name,
      email: data.email,
      role: data.role,
      customPermissions: data.customPermissions,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: 'pending'
    };

    const list = this.getInvitations();
    list.unshift(newInv);
    setLocal(KEYS.INVITATIONS, list);

    this.addAuditLog(
      'Issued Admin Invitation',
      'AdminInvitation',
      `Invited ${data.name} (${data.email}) as ${data.role}. Token expires in 48h.`,
      data.invitedByName,
      newInv.id
    );

    return newInv;
  }

  updateInvitationStatus(id: string, status: AdminInvitation['status']): void {
    const list = this.getInvitations().map(i => (i.id === id ? { ...i, status } : i));
    setLocal(KEYS.INVITATIONS, list);
  }

  revokeInvitation(id: string, actor = 'Super Admin'): void {
    const list = this.getInvitations().map(i => (i.id === id ? { ...i, status: 'revoked' as const } : i));
    setLocal(KEYS.INVITATIONS, list);
    this.addAuditLog('Revoked Admin Invitation', 'AdminInvitation', `Revoked invitation ${id}`, actor, id);
  }

  // ==========================================
  // ARTICLES CMS
  // ==========================================
  getArticles(): Article[] {
    return getLocal(KEYS.ARTICLES, INITIAL_ARTICLES);
  }

  getPublishedArticles(): Article[] {
    return this.getArticles().filter(a => a.status === 'published');
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.getArticles().find(a => a.slug === slug);
  }

  saveArticle(article: Article, actor = 'Admin'): void {
    const list = this.getArticles();
    const idx = list.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      list[idx] = article;
    } else {
      list.unshift(article);
    }
    setLocal(KEYS.ARTICLES, list);
    this.addAuditLog(`Saved Article: ${article.title}`, 'Article', `Status: ${article.status}`, actor, article.id);
  }

  updateArticleStatus(
    id: string,
    status: ContentWorkflowStatus,
    reviewNotes?: string,
    actor = 'Editor'
  ): void {
    const list = this.getArticles().map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          reviewNotes: reviewNotes !== undefined ? reviewNotes : a.reviewNotes,
          publishedAt: status === 'published' ? (a.publishedAt || new Date().toISOString()) : a.publishedAt,
          reviewedBy: actor
        };
      }
      return a;
    });
    setLocal(KEYS.ARTICLES, list);
    this.addAuditLog(`Article Workflow: ${status}`, 'Article', `Article ${id} updated to ${status}. Notes: ${reviewNotes || 'none'}`, actor, id);
  }

  deleteArticle(id: string, actor = 'Admin'): void {
    const list = this.getArticles().filter(a => a.id !== id);
    setLocal(KEYS.ARTICLES, list);
    this.addAuditLog('Deleted Article', 'Article', `Deleted article ${id}`, actor, id);
  }

  // ==========================================
  // VIDEOS CMS
  // ==========================================
  getVideos(): VideoItem[] {
    return getLocal(KEYS.VIDEOS, INITIAL_VIDEOS);
  }

  getPublishedVideos(): VideoItem[] {
    return this.getVideos().filter(v => v.status === 'published');
  }

  saveVideo(video: VideoItem, actor = 'Admin'): void {
    const list = this.getVideos();
    const idx = list.findIndex(v => v.id === video.id);
    if (idx >= 0) {
      list[idx] = video;
    } else {
      list.unshift(video);
    }
    setLocal(KEYS.VIDEOS, list);
    this.addAuditLog(`Saved Video: ${video.title}`, 'VideoItem', `Status: ${video.status}`, actor, video.id);
  }

  deleteVideo(id: string, actor = 'Admin'): void {
    const list = this.getVideos().filter(v => v.id !== id);
    setLocal(KEYS.VIDEOS, list);
    this.addAuditLog('Deleted Video', 'VideoItem', `Deleted video ${id}`, actor, id);
  }

  // ==========================================
  // PHOTO ALBUMS CMS
  // ==========================================
  getPhotoAlbums(): PhotoAlbum[] {
    return getLocal(KEYS.PHOTO_ALBUMS, INITIAL_PHOTO_ALBUMS);
  }

  getPublishedPhotoAlbums(): PhotoAlbum[] {
    return this.getPhotoAlbums().filter(a => a.status === 'published');
  }

  savePhotoAlbum(album: PhotoAlbum, actor = 'Admin'): void {
    const list = this.getPhotoAlbums();
    const idx = list.findIndex(a => a.id === album.id);
    if (idx >= 0) {
      list[idx] = album;
    } else {
      list.unshift(album);
    }
    setLocal(KEYS.PHOTO_ALBUMS, list);
    this.addAuditLog(`Saved Photo Album: ${album.title}`, 'PhotoAlbum', `${album.photos.length} photos`, actor, album.id);
  }

  deletePhotoAlbum(id: string, actor = 'Admin'): void {
    const list = this.getPhotoAlbums().filter(a => a.id !== id);
    setLocal(KEYS.PHOTO_ALBUMS, list);
    this.addAuditLog('Deleted Photo Album', 'PhotoAlbum', `Deleted album ${id}`, actor, id);
  }

  // ==========================================
  // MEDIA ASSETS LIBRARY
  // ==========================================
  getMediaAssets(): MediaAsset[] {
    return getLocal(KEYS.MEDIA, INITIAL_MEDIA_ASSETS);
  }

  saveMediaAsset(asset: MediaAsset, actor = 'Admin'): void {
    const list = this.getMediaAssets();
    const idx = list.findIndex(m => m.id === asset.id);
    if (idx >= 0) {
      list[idx] = asset;
    } else {
      list.unshift(asset);
    }
    setLocal(KEYS.MEDIA, list);
    this.addAuditLog(`Uploaded Media Asset: ${asset.filename}`, 'MediaAsset', `Type: ${asset.type}`, actor, asset.id);
  }

  deleteMediaAsset(id: string, actor = 'Admin'): void {
    const list = this.getMediaAssets().filter(m => m.id !== id);
    setLocal(KEYS.MEDIA, list);
    this.addAuditLog('Deleted Media Asset', 'MediaAsset', `Deleted media ${id}`, actor, id);
  }

  // ==========================================
  // ANNOUNCEMENTS
  // ==========================================
  getAnnouncements(): Announcement[] {
    return getLocal(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  getActiveAnnouncement(): Announcement | undefined {
    return this.getAnnouncements().find(a => a.active);
  }

  saveAnnouncement(ann: Announcement, actor = 'Admin'): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex(a => a.id === ann.id);
    if (idx >= 0) {
      list[idx] = ann;
    } else {
      list.unshift(ann);
    }
    setLocal(KEYS.ANNOUNCEMENTS, list);
    this.addAuditLog(`Saved Announcement: ${ann.title}`, 'Announcement', `Active: ${ann.active}`, actor, ann.id);
  }

  toggleAnnouncement(id: string, active: boolean, actor = 'Admin'): void {
    const list = this.getAnnouncements().map(a => (a.id === id ? { ...a, active } : a));
    setLocal(KEYS.ANNOUNCEMENTS, list);
    this.addAuditLog(`Toggled Announcement ${id} to ${active}`, 'Announcement', `Active: ${active}`, actor, id);
  }

  deleteAnnouncement(id: string, actor = 'Admin'): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    setLocal(KEYS.ANNOUNCEMENTS, list);
    this.addAuditLog('Deleted Announcement', 'Announcement', `Deleted announcement ${id}`, actor, id);
  }

  // ==========================================
  // WORK ITEMS (Piece of Our Work)
  // ==========================================
  getWorkItems(): WorkItem[] {
    return getLocal(KEYS.WORK_ITEMS, INITIAL_WORK_ITEMS);
  }

  getPublishedWorkItems(): WorkItem[] {
    return this.getWorkItems().filter(
      w => (w.workflowStatus === 'published' || w.status === 'published') && w.verificationStatus === 'verified'
    );
  }

  getWorkItemBySlug(slug: string): WorkItem | undefined {
    return this.getWorkItems().find(w => w.slug === slug);
  }

  saveWorkItem(item: WorkItem, actor = 'Admin'): void {
    const list = this.getWorkItems();
    const idx = list.findIndex(w => w.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    setLocal(KEYS.WORK_ITEMS, list);
    this.addAuditLog(`Saved Project: ${item.title}`, 'WorkItem', `Status: ${item.workflowStatus || item.status}`, actor, item.id);
  }

  updateWorkItem(id: string, updates: Partial<WorkItem>, actor = 'Admin'): void {
    const list = this.getWorkItems().map(w => (w.id === id ? { ...w, ...updates } : w));
    setLocal(KEYS.WORK_ITEMS, list);
    this.addAuditLog(`Updated Project (${id})`, 'WorkItem', `Updated fields: ${Object.keys(updates).join(', ')}`, actor, id);
  }

  deleteWorkItem(id: string, actor = 'Admin'): void {
    const list = this.getWorkItems().filter(w => w.id !== id);
    setLocal(KEYS.WORK_ITEMS, list);
    this.addAuditLog('Deleted Project', 'WorkItem', `Deleted project ${id}`, actor, id);
  }

  createWorkItem(item: Partial<WorkItem>, actor = 'Admin'): WorkItem {
    const newItem: WorkItem = {
      id: `work-${Date.now()}`,
      slug: item.slug || `project-${Date.now()}`,
      title: item.title || 'Untitled Field Project',
      summary: item.summary || '',
      description: item.description || '',
      coverImage: item.coverImage || '',
      category: item.category || 'Home Visits',
      location: item.location || 'Tashkent, Uzbekistan',
      eventDate: item.eventDate || new Date().toISOString().split('T')[0],
      supportedCommunity: item.supportedCommunity || 'Community Beneficiaries',
      status: (item.status as any) || 'draft',
      workflowStatus: item.workflowStatus || 'draft',
      verificationStatus: item.verificationStatus || 'pending',
      contributionAmount: item.contributionAmount,
      currency: item.currency || 'UZS',
      reportUrl: item.reportUrl,
      videoUrl: item.videoUrl,
      impactSummary: item.impactSummary,
      resourcesUsed: item.resourcesUsed,
      publishedAt: new Date().toISOString(),
      gallery: item.gallery || [],
      verifiedBy: item.verifiedBy || actor
    };
    this.saveWorkItem(newItem, actor);
    return newItem;
  }

  // ==========================================
  // STORIES
  // ==========================================
  getStories(): Story[] {
    return getLocal(KEYS.STORIES, INITIAL_STORIES);
  }

  getPublishedStories(): Story[] {
    return this.getStories().filter(s => (s.workflowStatus === 'published' || s.status === 'published'));
  }

  saveStory(story: Story, actor = 'Admin'): void {
    const list = this.getStories();
    const idx = list.findIndex(s => s.id === story.id);
    if (idx >= 0) {
      list[idx] = story;
    } else {
      list.unshift(story);
    }
    setLocal(KEYS.STORIES, list);
    this.addAuditLog(`Saved Story: ${story.title}`, 'Story', `Status: ${story.workflowStatus || story.status}`, actor, story.id);
  }

  deleteStory(id: string, actor = 'Admin'): void {
    const list = this.getStories().filter(s => s.id !== id);
    setLocal(KEYS.STORIES, list);
    this.addAuditLog('Deleted Story', 'Story', `Deleted story ${id}`, actor, id);
  }

  // ==========================================
  // HISTORY TIMELINE
  // ==========================================
  getHistoryTimeline(): HistoryEntry[] {
    return getLocal(KEYS.HISTORY, INITIAL_HISTORY_TIMELINE);
  }

  saveHistoryEntry(entry: HistoryEntry, actor = 'Admin'): void {
    const list = this.getHistoryTimeline();
    const idx = list.findIndex(h => h.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    setLocal(KEYS.HISTORY, list);
    this.addAuditLog(`Saved History Entry: ${entry.title}`, 'HistoryEntry', entry.id, actor, entry.id);
  }

  deleteHistoryEntry(id: string, actor = 'Admin'): void {
    const list = this.getHistoryTimeline().filter(h => h.id !== id);
    setLocal(KEYS.HISTORY, list);
    this.addAuditLog('Deleted History Entry', 'HistoryEntry', `Deleted ${id}`, actor, id);
  }

  getMilestones(): HistoryEntry[] {
    return this.getHistoryTimeline();
  }

  // ==========================================
  // CONTRIBUTIONS & FINANCE
  // ==========================================
  getContributions(): Contribution[] {
    return getLocal(KEYS.CONTRIBUTIONS, INITIAL_CONTRIBUTIONS);
  }

  getNextContributionReference(): string {
    const list = this.getContributions();
    const count = list.length + 1;
    const year = new Date().getFullYear();
    const padded = String(count).padStart(6, '0');
    return `SAFA-${year}-${padded}`;
  }

  recordContribution(data: {
    amount: number;
    currency: 'UZS' | 'USD';
    purpose: string;
    projectId?: string;
    projectName?: string;
    donorName: string;
    isAnonymous: boolean;
    paymentMethod: 'bank_transfer' | 'card_checkout' | 'cash_office';
  }): Contribution {
    const reference = this.getNextContributionReference();
    const newContrib: Contribution = {
      id: `c-${Date.now()}`,
      contributionNumber: reference,
      amount: data.amount,
      currency: data.currency,
      purpose: data.purpose,
      projectId: data.projectId,
      projectName: data.projectName,
      donorName: data.isAnonymous ? 'Anonymous Supporter' : data.donorName || 'Supporter',
      isAnonymous: data.isAnonymous,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString()
    };
    const list = this.getContributions();
    list.unshift(newContrib);
    setLocal(KEYS.CONTRIBUTIONS, list);
    this.addAuditLog(`Recorded Contribution ${reference} (${data.amount} ${data.currency})`, 'Contribution', `Purpose: ${data.purpose}`, 'System/Payment', newContrib.id);
    return newContrib;
  }

  updateContributionStatus(id: string, status: Contribution['status'], actor = 'Finance Manager'): void {
    const list = this.getContributions().map(c =>
      c.id === id ? { ...c, status, verifiedAt: new Date().toISOString() } : c
    );
    setLocal(KEYS.CONTRIBUTIONS, list);
    this.addAuditLog(`Updated Contribution Status: ${status}`, 'Contribution', `Contribution ${id} marked ${status}`, actor, id);
  }

  // ==========================================
  // VOLUNTEERS
  // ==========================================
  getVolunteers(): VolunteerApplication[] {
    return getLocal<VolunteerApplication[]>(KEYS.VOLUNTEERS, []);
  }

  submitVolunteerApplication(app: Omit<VolunteerApplication, 'id' | 'status' | 'createdAt'>): VolunteerApplication {
    const newApp: VolunteerApplication = {
      ...app,
      id: `vol-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    const list = this.getVolunteers();
    list.unshift(newApp);
    setLocal(KEYS.VOLUNTEERS, list);
    this.addAuditLog('New Volunteer Application', 'VolunteerApplication', `Applicant: ${app.fullName} (${app.email})`, 'Public Form', newApp.id);
    return newApp;
  }

  updateVolunteerStatus(id: string, status: VolunteerApplication['status'], actor = 'Volunteer Manager'): void {
    const list = this.getVolunteers().map(v => (v.id === id ? { ...v, status } : v));
    setLocal(KEYS.VOLUNTEERS, list);
    this.addAuditLog(`Updated Volunteer Status: ${status}`, 'VolunteerApplication', `Applicant ${id} updated to ${status}`, actor, id);
  }

  deleteVolunteer(id: string, actor = 'Volunteer Manager'): void {
    const list = this.getVolunteers().filter(v => v.id !== id);
    setLocal(KEYS.VOLUNTEERS, list);
    this.addAuditLog('Deleted Volunteer Application', 'VolunteerApplication', `Deleted applicant ${id}`, actor, id);
  }

  addVolunteer(vol: any): VolunteerApplication {
    return this.submitVolunteerApplication({
      fullName: vol.fullName,
      email: vol.email,
      phone: vol.phone || vol.phoneOrTelegram || '',
      phoneOrTelegram: vol.phoneOrTelegram || vol.phone || '',
      city: vol.city || 'Tashkent',
      skills: vol.skills || '',
      interests: vol.interests || ['General Community Support'],
      availability: vol.availability || 'Flexible',
      message: vol.message || '',
      isLegalAgeConfirmed: vol.isLegalAgeConfirmed ?? true
    });
  }

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================
  getContactMessages(): ContactMessage[] {
    return getLocal<ContactMessage[]>(KEYS.CONTACTS, []);
  }

  submitContactMessage(msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    const list = this.getContactMessages();
    list.unshift(newMsg);
    setLocal(KEYS.CONTACTS, list);
    this.addAuditLog('New Contact Inquiry', 'ContactMessage', `Inquiry from ${msg.name} (${msg.subject})`, 'Public Form', newMsg.id);
    return newMsg;
  }

  updateContactStatus(id: string, status: ContactMessage['status'], actor = 'Admin'): void {
    const list = this.getContactMessages().map(m => (m.id === id ? { ...m, status } : m));
    setLocal(KEYS.CONTACTS, list);
    this.addAuditLog(`Updated Inquiry Status: ${status}`, 'ContactMessage', `Message ${id} set to ${status}`, actor, id);
  }

  deleteContactMessage(id: string, actor = 'Admin'): void {
    const list = this.getContactMessages().filter(m => m.id !== id);
    setLocal(KEYS.CONTACTS, list);
    this.addAuditLog('Deleted Contact Inquiry', 'ContactMessage', `Deleted message ${id}`, actor, id);
  }

  addContactMessage(msg: { name: string; email: string; message: string; subject?: string; phone?: string }): ContactMessage {
    return this.submitContactMessage({
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject || 'General Inquiry',
      message: msg.message
    });
  }

  // ==========================================
  // TRANSPARENCY REPORTS
  // ==========================================
  getReports(): TransparencyReport[] {
    return getLocal(KEYS.REPORTS, INITIAL_TRANSPARENCY_REPORTS);
  }

  saveReport(rep: TransparencyReport, actor = 'Admin'): void {
    const list = this.getReports();
    const idx = list.findIndex(r => r.id === rep.id);
    if (idx >= 0) {
      list[idx] = rep;
    } else {
      list.unshift(rep);
    }
    setLocal(KEYS.REPORTS, list);
    this.addAuditLog(`Saved Transparency Report: ${rep.title}`, 'TransparencyReport', `Year: ${rep.year}`, actor, rep.id);
  }

  deleteReport(id: string, actor = 'Admin'): void {
    const list = this.getReports().filter(r => r.id !== id);
    setLocal(KEYS.REPORTS, list);
    this.addAuditLog('Deleted Transparency Report', 'TransparencyReport', `Deleted report ${id}`, actor, id);
  }

  // ==========================================
  // FOUNDER & PROFILE
  // ==========================================
  getFounderProfile(): FounderProfile {
    const profile = getLocal(KEYS.FOUNDER, INITIAL_FOUNDER_PROFILE);
    if (!profile.imageUrl || profile.imageUrl === '/nargiza_ceo.jpg' || profile.imageUrl === '/founder_nargiza.jpg' || profile.imageUrl === '/safateam.jpg' || profile.imageUrl.includes('unsplash') || !profile.image || profile.image === '/nargiza_ceo.jpg' || profile.image === '/founder_nargiza.jpg') {
      profile.imageUrl = '/ceo.png';
      profile.image = '/ceo.png';
    }
    return profile;
  }

  updateFounderProfile(profile: FounderProfile, actor = 'Super Admin'): void {
    setLocal(KEYS.FOUNDER, profile);
    this.addAuditLog('Updated Founder Profile', 'FounderProfile', profile.name, actor);
  }

  saveFounderProfile(profile: FounderProfile, actor = 'Super Admin'): void {
    this.updateFounderProfile(profile, actor);
  }

  // ==========================================
  // SOCIAL LINKS
  // ==========================================
  getSocialLinks(): SocialLink[] {
    return getLocal(KEYS.SOCIALS, INITIAL_SOCIAL_LINKS);
  }

  updateSocialLink(id: string, updates: Partial<SocialLink>, actor = 'Admin'): void {
    const list = this.getSocialLinks().map(s => (s.id === id ? { ...s, ...updates } : s));
    setLocal(KEYS.SOCIALS, list);
    this.addAuditLog(`Updated Official Channel Link (${id})`, 'SocialLink', id, actor, id);
  }

  saveSocialLinks(links: SocialLink[], actor = 'Admin'): void {
    setLocal(KEYS.SOCIALS, links);
    this.addAuditLog('Updated Official Social Links', 'SocialLink', 'Updated channel list', actor);
  }

  addSocialLink(link: Omit<SocialLink, 'id'>, actor = 'Admin'): SocialLink {
    const newLink: SocialLink = {
      ...link,
      id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const list = this.getSocialLinks();
    list.push(newLink);
    setLocal(KEYS.SOCIALS, list);
    this.addAuditLog(`Added Official Channel (${newLink.title})`, 'SocialLink', newLink.url, actor, newLink.id);
    return newLink;
  }

  deleteSocialLink(id: string, actor = 'Admin'): void {
    const list = this.getSocialLinks().filter(s => s.id !== id);
    setLocal(KEYS.SOCIALS, list);
    this.addAuditLog('Deleted Official Channel', 'SocialLink', `Deleted link ${id}`, actor, id);
  }

  reorderSocialLinks(orderedIds: string[], actor = 'Admin'): void {
    const list = this.getSocialLinks();
    const map = new Map(list.map(item => [item.id, item]));
    const reordered: SocialLink[] = [];
    orderedIds.forEach((id, index) => {
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, displayOrder: index + 1 });
        map.delete(id);
      }
    });
    // Append any remaining
    map.forEach(item => reordered.push(item));
    setLocal(KEYS.SOCIALS, reordered);
    this.addAuditLog('Reordered Social Channels', 'SocialLink', 'Updated display sequence', actor);
  }

  // ==========================================
  // IMPACT STATS
  // ==========================================
  getImpactStats(): ImpactStatistic[] {
    return getLocal(KEYS.STATS, INITIAL_IMPACT_STATS);
  }

  updateImpactStat(id: string, updates: Partial<ImpactStatistic>, actor = 'Admin'): void {
    const list = this.getImpactStats().map(st => (st.id === id ? { ...st, ...updates } : st));
    setLocal(KEYS.STATS, list);
    this.addAuditLog(`Updated Impact Metric (${id})`, 'ImpactStatistic', id, actor, id);
  }

  // ==========================================
  // PROGRAMS
  // ==========================================
  getPrograms(): Program[] {
    return getLocal(KEYS.PROGRAMS, INITIAL_PROGRAMS);
  }

  getProgramById(id: string): Program | undefined {
    return this.getPrograms().find(p => p.id === id);
  }

  saveProgram(prog: Program, actor = 'Admin'): void {
    const list = this.getPrograms();
    const existing = list.findIndex(p => p.id === prog.id);
    if (existing >= 0) {
      list[existing] = prog;
    } else {
      list.push(prog);
    }
    setLocal(KEYS.PROGRAMS, list);
    this.addAuditLog(`Saved Program: ${prog.title}`, 'Program', prog.id, actor, prog.id);
  }

  deleteProgram(id: string, actor = 'Admin'): void {
    const list = this.getPrograms().filter(p => p.id !== id);
    setLocal(KEYS.PROGRAMS, list);
    this.addAuditLog('Deleted Program', 'Program', `Deleted program ${id}`, actor, id);
  }

  // ==========================================
  // BANK CONFIG
  // ==========================================
  getBankConfig(): DonationBankConfig {
    return getLocal(KEYS.BANK, INITIAL_BANK_CONFIG);
  }

  updateBankConfig(cfg: DonationBankConfig, actor = 'Finance Manager'): void {
    setLocal(KEYS.BANK, cfg);
    this.addAuditLog('Updated Bank Transfer Configuration', 'DonationBankConfig', 'Bank details modified', actor);
  }

  saveBankConfig(cfg: DonationBankConfig, actor = 'Finance Manager'): void {
    this.updateBankConfig(cfg, actor);
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs(): AuditLog[] {
    return getLocal<AuditLog[]>(KEYS.AUDIT, []);
  }

  // ==========================================
  // EVENTS
  // ==========================================
  getEvents(): EventItem[] {
    return getLocal<EventItem[]>(KEYS.EVENTS, INITIAL_EVENTS);
  }

  getUpcomingEvents(): EventItem[] {
    return this.getEvents().filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  }

  getEventBySlug(slug: string): EventItem | undefined {
    return this.getEvents().find(e => e.slug === slug || e.id === slug);
  }

  saveEvent(event: EventItem, actor = 'Admin'): void {
    const list = this.getEvents();
    const idx = list.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      list[idx] = event;
    } else {
      list.unshift(event);
    }
    setLocal(KEYS.EVENTS, list);
    this.addAuditLog(`Saved Event: ${event.title}`, 'EventItem', `Event ${event.slug}`, actor, event.id);
  }

  deleteEvent(id: string, actor = 'Admin'): void {
    const list = this.getEvents().filter(e => e.id !== id);
    setLocal(KEYS.EVENTS, list);
    this.addAuditLog('Deleted Event', 'EventItem', `Deleted event ${id}`, actor, id);
  }

  // ==========================================
  // DONATION CAMPAIGNS
  // ==========================================
  getDonationCampaigns(): DonationCampaign[] {
    return getLocal<DonationCampaign[]>(KEYS.CAMPAIGNS, INITIAL_DONATION_CAMPAIGNS);
  }

  saveDonationCampaign(campaign: DonationCampaign, actor = 'Admin'): void {
    const list = this.getDonationCampaigns();
    const idx = list.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      list[idx] = campaign;
    } else {
      list.unshift(campaign);
    }
    setLocal(KEYS.CAMPAIGNS, list);
    this.addAuditLog(`Saved Donation Campaign: ${campaign.title}`, 'DonationCampaign', campaign.id, actor, campaign.id);
  }

  deleteDonationCampaign(id: string, actor = 'Admin'): void {
    const list = this.getDonationCampaigns().filter(c => c.id !== id);
    setLocal(KEYS.CAMPAIGNS, list);
    this.addAuditLog('Deleted Donation Campaign', 'DonationCampaign', `Deleted campaign ${id}`, actor, id);
  }

  addAuditLog(action: string, entity: string, details: string, actor = 'Admin', entityId?: string): void {
    const user = this.getCurrentUser();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userName: user ? user.name : actor,
      userRole: user ? user.role : 'admin',
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    const logs = this.getAuditLogs();
    logs.unshift(log);
    setLocal(KEYS.AUDIT, logs.slice(0, 150));
  }

  // ==========================================
  // SESSION
  // ==========================================
  getCurrentUser(): User | null {
    return getLocal<User | null>(KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    setLocal(KEYS.CURRENT_USER, user);
  }

  isAdminUnlocked(): boolean {
    return getLocal<boolean>(KEYS.ADMIN_UNLOCKED, false);
  }

  setAdminUnlocked(unlocked: boolean): void {
    setLocal(KEYS.ADMIN_UNLOCKED, unlocked);
  }
}

export const storage = new StorageService();
