export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'content_manager'
  | 'media_manager'
  | 'editor'
  | 'finance'
  | 'volunteer_manager'
  | 'viewer';

export type ContentWorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

export type PermissionKey =
  | 'content.create'
  | 'content.edit'
  | 'content.delete'
  | 'content.publish'
  | 'content.review'
  | 'media.upload'
  | 'media.edit'
  | 'media.delete'
  | 'work.create'
  | 'work.edit'
  | 'work.publish'
  | 'work.archive'
  | 'stories.create'
  | 'stories.edit'
  | 'stories.publish'
  | 'reports.create'
  | 'reports.publish'
  | 'contributions.view'
  | 'contributions.manage'
  | 'volunteers.view'
  | 'volunteers.manage'
  | 'messages.view'
  | 'messages.manage'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  | 'settings.manage';

export type UserStatus = 'active' | 'disabled' | 'pending_invitation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  customPermissions?: Partial<Record<PermissionKey, boolean>>;
  createdAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
}

export interface AdminInvitation {
  id: string;
  token: string;
  name: string;
  email: string;
  role: UserRole;
  customPermissions?: Partial<Record<PermissionKey, boolean>>;
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  galleryImages: string[];
  videoUrl?: string;
  author: string;
  authorRole?: string;
  authorId?: string;
  category: string;
  tags: string[];
  location: string;
  date: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: ContentWorkflowStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  category: string;
  relatedProjectId?: string;
  author: string;
  status: ContentWorkflowStatus;
  publishedAt: string;
  duration?: string;
}

export interface PhotoAlbumItem {
  id: string;
  url: string;
  caption: string;
  altText?: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photos: PhotoAlbumItem[];
  date: string;
  location: string;
  category: string;
  relatedProjectId?: string;
  status: ContentWorkflowStatus;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  title: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  altText?: string;
  caption?: string;
  tags: string[];
  relatedContent?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'urgent' | 'success';
  active: boolean;
  linkText?: string;
  linkUrl?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface ImpactStatistic {
  id: string;
  metric: string;
  value?: string;
  label: string;
  description: string;
  period: string;
  verifiedAt: string;
  isReal: boolean;
}

export interface Program {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  status: 'active' | 'upcoming' | 'completed';
  location: string;
  peopleHelped?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

export type WorkStatus = 'draft' | 'review' | 'verified' | 'published' | 'archived';

export interface WorkMedia {
  id: string;
  fileUrl: string;
  altText: string;
  caption?: string;
  displayOrder: number;
}

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  category: string;
  location: string;
  eventDate: string;
  supportedCommunity: string;
  status: WorkStatus;
  workflowStatus?: ContentWorkflowStatus;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  contributionAmount?: number;
  currency?: string;
  reportUrl?: string;
  videoUrl?: string;
  impactSummary?: string;
  resourcesUsed?: string;
  reviewNotes?: string;
  gallery: WorkMedia[];
  publishedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  body: string;
  coverImage: string;
  category: string;
  author: string;
  date: string;
  consentStatus: 'verified_consent' | 'anonymized';
  publishedAt: string;
  status: 'published' | 'draft';
  workflowStatus?: ContentWorkflowStatus;
  reviewNotes?: string;
}

export interface HistoryEntry {
  id: string;
  year: string;
  date: string;
  title: string;
  description: string;
  image?: string;
  verifiedImpact?: string;
  impactStat?: string;
}

export type SocialPlatform =
  | 'telegram'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'gmail'
  | 'email'
  | 'facebook'
  | 'tiktok'
  | 'x'
  | 'website'
  | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  title: string;
  url: string;
  description: string;
  handle: string;
  enabled: boolean;
  displayOrder: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  coverImage: string;
  gallery?: string[];
  registrationUrl?: string;
  registrationInfo?: string;
  category?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  goalAmount?: number;
  raisedAmount: number;
  currency: string;
  coverImage: string;
  category?: string;
  status: 'active' | 'completed' | 'paused';
  bankInstructions?: string;
  qrCodeUrl?: string;
  cardPaymentNote?: string;
  createdAt: string;
}

export interface Contribution {
  id: string;
  contributionNumber: string; // e.g. SAFA-2026-000001
  amount: number;
  currency: 'UZS' | 'USD';
  purpose: string;
  projectId?: string;
  projectName?: string;
  donorName: string;
  isAnonymous: boolean;
  paymentMethod: 'bank_transfer' | 'card_checkout' | 'cash_office';
  status: 'completed' | 'verified' | 'pending' | 'refunded';
  createdAt: string;
  verifiedAt?: string;
}

export interface VolunteerApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  phoneOrTelegram?: string;
  city?: string;
  skills?: string;
  isLegalAgeConfirmed?: boolean;
  interests: string[];
  availability: string;
  message: string;
  status: 'new' | 'reviewed' | 'contacted' | 'accepted' | 'approved' | 'rejected' | 'archived' | 'pending';
  createdAt: string;
}

export type Milestone = HistoryEntry;

export type BankConfig = DonationBankConfig;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  createdAt: string;
}

export interface TransparencyReport {
  id: string;
  title: string;
  category: 'financial' | 'project' | 'annual' | 'audit';
  year: string;
  fileUrl: string;
  fileSize: string;
  publishedAt: string;
  summary: string;
}

export interface FounderProfile {
  name: string;
  title: string;
  organization: string;
  quote: string;
  biography: string;
  imageUrl: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  mission?: string;
  vision?: string;
  aboutText?: string;
  // Backward compatibility convenience aliases
  role?: string;
  image?: string;
  bio?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  timestamp: string;
  details: string;
}

export interface DonationBankConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  mfo: string;
  inn: string;
  currency: string;
  note: string;
}
