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
  User,
  Article,
  VideoItem,
  PhotoAlbum,
  MediaAsset,
  Announcement,
  AdminInvitation,
  EventItem,
  DonationCampaign
} from '../types';

// Public content starts empty and is published through the admin panel after verification.
export const INITIAL_FOUNDER_PROFILE: FounderProfile = {
  name: '',
  title: '',
  organization: '',
  quote: '',
  biography: '',
  imageUrl: ''
};

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [];
export const INITIAL_IMPACT_STATS: ImpactStatistic[] = [];
export const WHY_CHOOSE_SAFA: Array<{
  id: string;
  stat: string;
  tag: string;
  title: string;
  description: string;
}> = [];
export const INITIAL_PROGRAMS: Program[] = [];
export const INITIAL_WORK_ITEMS: WorkItem[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_HISTORY_TIMELINE: HistoryEntry[] = [];
export const INITIAL_CONTRIBUTIONS: Contribution[] = [];
export const INITIAL_TRANSPARENCY_REPORTS: TransparencyReport[] = [];

export const INITIAL_BANK_CONFIG: DonationBankConfig = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  mfo: '',
  inn: '',
  currency: '',
  note: ''
};

// Keep one technical bootstrap account so the local admin panel remains reachable.
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'SAFA Administrator',
    email: '',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date(0).toISOString()
  }
];

export const INITIAL_INVITATIONS: AdminInvitation[] = [];
export const INITIAL_ARTICLES: Article[] = [];
export const INITIAL_VIDEOS: VideoItem[] = [];
export const INITIAL_PHOTO_ALBUMS: PhotoAlbum[] = [];
export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_EVENTS: EventItem[] = [];
export const INITIAL_DONATION_CAMPAIGNS: DonationCampaign[] = [];
