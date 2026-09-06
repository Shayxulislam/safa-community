import React from 'react';
import {
  Newspaper,
  FolderHeart,
  Users2,
  Landmark,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Share2,
  Building2,
  Calendar,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../services/storage';
import { auth, ROLE_DETAILS } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AdminTab } from './AdminSidebar';

interface AdminOverviewTabProps {
  currentUser: User;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const articles = storage.getArticles();
  const workItems = storage.getWorkItems();
  const volunteers = storage.getVolunteers();
  const contributions = storage.getContributions();
  const auditLogs = storage.getAuditLogs();
  const invitations = storage.getInvitations();

  const publishedArticles = articles.filter(a => a.status === 'published');
  const reviewPendingArticles = articles.filter(a => a.status === 'submitted' || a.status === 'under_review');
  const draftArticles = articles.filter(a => a.status === 'draft');

  const publishedProjects = workItems.filter(w => w.workflowStatus === 'published' || w.status === 'published');
  const pendingVolunteers = volunteers.filter(v => v.status === 'new');
  const totalFunds = contributions
    .filter(c => c.status === 'completed')
    .reduce((acc, c) => acc + (c.currency === 'UZS' ? c.amount : c.amount * 12500), 0);

  const isSuperAdmin = currentUser.role === 'super_admin';
  const canPublish = auth.hasPermission('content.publish', currentUser);
  const canCreate = auth.hasPermission('content.create', currentUser);

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#5E6E52] text-[#FDFCF9] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>SAFA Admin Management & CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/85 max-w-xl">
            You are authenticated as <strong>{ROLE_DETAILS[currentUser.role]?.title}</strong>.
            {canPublish
              ? ' You have full editorial approval & direct publication privileges.'
              : ' Content you create follows the "Draft → Review → Publish" workflow to guarantee quality.'}
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          {canCreate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('articles')}
              icon={<Plus className="w-4 h-4" />}
            >
              New Article
            </Button>
          )}
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('team')}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              icon={<Plus className="w-4 h-4" />}
            >
              Invite Admin
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-[#E5E0D5] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-[#6D6A61] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Published Articles</span>
            <div className="w-8 h-8 rounded-lg bg-[#5E6E52]/10 text-[#5E6E52] flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#3D3B36]">{publishedArticles.length}</div>
          <div className="text-[11px] text-[#6D6A61] mt-1 flex items-center gap-1">
            <span className="text-[#5E6E52] font-semibold">{articles.length} total in CMS</span>
            <span>• {draftArticles.length} drafts</span>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E0D5] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-[#6D6A61] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Review Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-[#B06D50]/10 text-[#B06D50] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#3D3B36]">{reviewPendingArticles.length}</div>
          <div className="text-[11px] text-[#6D6A61] mt-1">
            Pending editorial review before release
          </div>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E0D5] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-[#6D6A61] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Field Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#5E6E52]/10 text-[#5E6E52] flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#3D3B36]">{publishedProjects.length}</div>
          <div className="text-[11px] text-[#6D6A61] mt-1">
            Verified community initiatives live
          </div>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E0D5] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-[#6D6A61] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">New Volunteers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#3D3B36]">{pendingVolunteers.length}</div>
          <div className="text-[11px] text-[#6D6A61] mt-1">
            Applicants awaiting coordinator contact
          </div>
        </Card>
      </div>

      {/* Quick Platform Management Hub */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">
          Administrative Management Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigateTab('social')}
            className="p-4 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5E6E52] hover:shadow-2xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#5E6E52]/10 text-[#5E6E52] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#3D3B36]">Official Links</div>
            <p className="text-[10px] text-[#6D6A61] mt-0.5">Telegram, Instagram, channels</p>
          </button>

          <button
            onClick={() => onNavigateTab('organization')}
            className="p-4 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5E6E52] hover:shadow-2xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#B06D50]/10 text-[#B06D50] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#3D3B36]">Founder & Profile</div>
            <p className="text-[10px] text-[#6D6A61] mt-0.5">Leadership, mission, address</p>
          </button>

          <button
            onClick={() => onNavigateTab('events')}
            className="p-4 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5E6E52] hover:shadow-2xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#5E6E52]/10 text-[#5E6E52] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#3D3B36]">Community Events</div>
            <p className="text-[10px] text-[#6D6A61] mt-0.5">Drives, dates, registrations</p>
          </button>

          <button
            onClick={() => onNavigateTab('donations')}
            className="p-4 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5E6E52] hover:shadow-2xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#3D3B36]">Campaigns & Bank</div>
            <p className="text-[10px] text-[#6D6A61] mt-0.5">Goals, targets, wire setup</p>
          </button>

          <button
            onClick={() => onNavigateTab('contacts')}
            className="p-4 rounded-2xl bg-white border border-[#E5E0D5] hover:border-[#5E6E52] hover:shadow-2xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#3D3B36]">Inquiries Inbox</div>
            <p className="text-[10px] text-[#6D6A61] mt-0.5">Contact messages & mutual aid</p>
          </button>
        </div>
      </div>

      {/* Editorial Workflow Status Visualization */}
      <Card className="p-6 bg-[#FDFCF9] border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
              Content Workflow: Draft → Review → Publish
            </h3>
            <p className="text-xs text-[#6D6A61]">
              Strict two-tier verification prevents accidental publishing and ensures high editorial standards.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('articles')}
            className="text-xs font-bold text-[#5E6E52] hover:underline flex items-center gap-1"
          >
            Manage Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1: Drafts */}
          <div className="p-4 rounded-2xl bg-[#F1EDE4] border border-[#E5E0D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">1. In Progress</span>
              <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                {draftArticles.length} items
              </span>
            </div>
            <p className="text-xs text-[#3D3B36]">
              Authored by Content Managers & Editors. Not visible to the public.
            </p>
            <div className="text-[11px] text-[#6D6A61]">
              Next action: Author clicks <strong>"Submit for Review"</strong>
            </div>
          </div>

          {/* Step 2: Under Review */}
          <div className="p-4 rounded-2xl bg-[#B06D50]/10 border border-[#B06D50]/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B06D50]">2. Editorial Review</span>
              <span className="px-2 py-0.5 rounded-full bg-[#B06D50] text-white text-[10px] font-bold">
                {reviewPendingArticles.length} pending
              </span>
            </div>
            <p className="text-xs text-[#3D3B36]">
              Queue for Lead Editors or SAFA Owner to verify media, facts, and tone.
            </p>
            <div className="text-[11px] text-[#6D6A61]">
              Actions: <strong>Approve & Publish</strong> or <strong>Reject with notes</strong>
            </div>
          </div>

          {/* Step 3: Live */}
          <div className="p-4 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5E6E52]">3. Published Live</span>
              <span className="px-2 py-0.5 rounded-full bg-[#5E6E52] text-white text-[10px] font-bold">
                {publishedArticles.length} live
              </span>
            </div>
            <p className="text-xs text-[#3D3B36]">
              Instantly visible on the SAFA public website (/articles and /work).
            </p>
            <div className="text-[11px] text-[#6D6A61]">
              Actions: Can be updated or archived any time by authorized editors.
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Section: Recent Audit Activity + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Logs (2 cols) */}
        <Card className="lg:col-span-2 p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-[#3D3B36]">
                Recent Administrative Activity
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Immutable audit trail of actions taken by all team members
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-[#5E6E52] hover:underline"
            >
              View Full Trail →
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-[#F1EDE4]/50 border border-[#E5E0D5] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#3D3B36]">{log.userName}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-[#6D6A61] border border-[#E5E0D5]">
                      {log.userRole}
                    </span>
                    <span className="text-[#6D6A61]">• {log.action}</span>
                  </div>
                  <p className="text-[#6D6A61] text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                </div>

                <div className="text-[10px] text-[#6D6A61] whitespace-nowrap shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Administration Governance Summary */}
        <Card className="p-6 bg-[#FDFCF9] border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3D3B36]">
            Governance & Roles
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-between">
              <span className="text-[#6D6A61]">Active Administrators</span>
              <span className="font-bold text-[#3D3B36]">{storage.getUsers().length}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-between">
              <span className="text-[#6D6A61]">Pending Invitations</span>
              <span className="font-bold text-[#B06D50]">{invitations.filter(i => i.status === 'pending').length}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-between">
              <span className="text-[#6D6A61]">Active Site Announcement</span>
              <span className="font-bold text-[#5E6E52]">
                {storage.getActiveAnnouncement() ? 'Enabled' : 'None'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E5E0D5] flex items-center justify-between">
              <span className="text-[#6D6A61]">Audit Trail Retention</span>
              <span className="font-bold text-[#3D3B36]">Active (150 entries)</span>
            </div>
          </div>

          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={() => onNavigateTab('team')}
            >
              Manage Staff & Permissions →
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};
