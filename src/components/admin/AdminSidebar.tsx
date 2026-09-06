import React from 'react';
import {
  LayoutDashboard,
  Newspaper,
  FolderHeart,
  Image as ImageIcon,
  Bell,
  BookOpen,
  Users2,
  MessageSquare,
  Landmark,
  FileSpreadsheet,
  ShieldAlert,
  History,
  Settings,
  Lock,
  ChevronRight,
  Calendar,
  Share2,
  Building2,
  HeartHandshake
} from 'lucide-react';
import { User, PermissionKey } from '../../types';
import { auth, ROLE_DETAILS } from '../../services/auth';
import { storage } from '../../services/storage';

export type AdminTab =
  | 'overview'
  | 'articles'
  | 'projects'
  | 'events'
  | 'media'
  | 'announcements'
  | 'stories'
  | 'volunteers'
  | 'contacts'
  | 'donations'
  | 'finance'
  | 'reports'
  | 'social'
  | 'organization'
  | 'team'
  | 'audit'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser: User;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser
}) => {
  const articlesCount = storage.getArticles().filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const volunteersCount = storage.getVolunteers().filter(v => v.status === 'new').length;
  const contactsCount = storage.getContactMessages().filter(c => c.status === 'new').length;

  const isSuperAdmin = currentUser.role === 'super_admin';

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    requiredPermission?: PermissionKey;
    superAdminOnly?: boolean;
    badge?: number;
  }

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'DASHBOARD',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: <LayoutDashboard className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'CONTENT & EDITORIAL',
      items: [
        {
          id: 'articles',
          label: 'Articles & News',
          icon: <Newspaper className="w-4 h-4" />,
          requiredPermission: 'content.create',
          badge: articlesCount > 0 ? articlesCount : undefined
        },
        {
          id: 'projects',
          label: 'Field Projects',
          icon: <FolderHeart className="w-4 h-4" />,
          requiredPermission: 'work.create'
        },
        {
          id: 'events',
          label: 'Community Events',
          icon: <Calendar className="w-4 h-4" />,
          requiredPermission: 'work.create'
        },
        {
          id: 'stories',
          label: 'Human Stories',
          icon: <BookOpen className="w-4 h-4" />,
          requiredPermission: 'stories.create'
        },
        {
          id: 'announcements',
          label: 'Announcements',
          icon: <Bell className="w-4 h-4" />,
          requiredPermission: 'content.create'
        }
      ]
    },
    {
      title: 'MEDIA ASSETS',
      items: [
        {
          id: 'media',
          label: 'Media Library',
          icon: <ImageIcon className="w-4 h-4" />,
          requiredPermission: 'media.upload'
        }
      ]
    },
    {
      title: 'COMMUNITY & OPERATIONS',
      items: [
        {
          id: 'volunteers',
          label: 'Volunteers',
          icon: <Users2 className="w-4 h-4" />,
          requiredPermission: 'volunteers.view',
          badge: volunteersCount > 0 ? volunteersCount : undefined
        },
        {
          id: 'contacts',
          label: 'Inquiries',
          icon: <MessageSquare className="w-4 h-4" />,
          requiredPermission: 'messages.view',
          badge: contactsCount > 0 ? contactsCount : undefined
        },
        {
          id: 'donations',
          label: 'Donation Campaigns',
          icon: <HeartHandshake className="w-4 h-4" />,
          requiredPermission: 'contributions.manage'
        },
        {
          id: 'finance',
          label: 'Finance & Ledger',
          icon: <Landmark className="w-4 h-4" />,
          requiredPermission: 'contributions.view'
        },
        {
          id: 'reports',
          label: 'Transparency',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          requiredPermission: 'reports.create'
        }
      ]
    },
    {
      title: 'CHANNELS & ORGANIZATION',
      items: [
        {
          id: 'social',
          label: 'Official Channels',
          icon: <Share2 className="w-4 h-4" />,
          requiredPermission: 'settings.manage'
        },
        {
          id: 'organization',
          label: 'Founder & SAFA Profile',
          icon: <Building2 className="w-4 h-4" />,
          requiredPermission: 'settings.manage'
        }
      ]
    },
    {
      title: 'GOVERNANCE & ACCESS',
      items: [
        {
          id: 'team',
          label: 'Team & Admins',
          icon: <ShieldAlert className="w-4 h-4" />,
          superAdminOnly: true
        },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: <History className="w-4 h-4" />
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: <Settings className="w-4 h-4" />,
          requiredPermission: 'settings.manage'
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FDFCF9] border-r border-[#E5E0D5] flex flex-col shrink-0 min-h-[calc(100vh-65px)] text-left">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {sections.map((sec, secIdx) => {
          return (
            <div key={secIdx} className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61] px-3">
                {sec.title}
              </h4>

              <div className="space-y-1">
                {sec.items.map(item => {
                  // Check permission
                  let hasAccess = true;
                  if (item.superAdminOnly && !isSuperAdmin) {
                    hasAccess = false;
                  } else if (item.requiredPermission) {
                    hasAccess = auth.hasPermission(item.requiredPermission, currentUser) || isSuperAdmin;
                  }

                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => hasAccess && onTabChange(item.id)}
                      disabled={!hasAccess}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#5E6E52] text-white shadow-2xs'
                          : hasAccess
                          ? 'text-[#3D3B36] hover:bg-[#F1EDE4] hover:text-[#5E6E52]'
                          : 'text-[#9C988D] opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : hasAccess ? 'text-[#5E6E52]' : 'text-[#9C988D]'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive ? 'bg-white text-[#5E6E52]' : 'bg-[#B06D50] text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {!hasAccess && (
                          <Lock className="w-3 h-3 text-[#9C988D]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Summary Footnote */}
      <div className="p-4 border-t border-[#E5E0D5] bg-[#F1EDE4]/50">
        <div className="text-[11px] text-[#6D6A61] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#3D3B36]">RBAC Policy</span>
            <span className="text-[10px] uppercase font-bold text-[#5E6E52]">Enforced</span>
          </div>
          <p className="text-[10px] leading-tight text-[#6D6A61]">
            {ROLE_DETAILS[currentUser.role]?.description}
          </p>
        </div>
      </div>
    </aside>
  );
};
