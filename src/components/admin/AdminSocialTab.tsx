import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Send,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { SocialLink, SocialPlatform, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminSocialTabProps {
  currentUser: User;
  onRefresh: () => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; placeholder: string; defaultIcon: string }[] = [
  { id: 'telegram', label: 'Telegram Channel / Group', placeholder: 'https://t.me/SafaUzbekistan', defaultIcon: 'Send' },
  { id: 'instagram', label: 'Instagram Profile', placeholder: 'https://instagram.com/safa_uzb_', defaultIcon: 'Instagram' },
  { id: 'youtube', label: 'YouTube Channel', placeholder: 'https://youtube.com/@SafaUzbekistan', defaultIcon: 'Youtube' },
  { id: 'linkedin', label: 'LinkedIn Page / Profile', placeholder: 'https://linkedin.com/in/...', defaultIcon: 'Linkedin' },
  { id: 'email', label: 'Official Email (mailto:)', placeholder: 'mailto:safaauzb@gmail.com', defaultIcon: 'Mail' },
  { id: 'facebook', label: 'Facebook Page', placeholder: 'https://facebook.com/safa.uzb', defaultIcon: 'Globe' },
  { id: 'tiktok', label: 'TikTok Account', placeholder: 'https://tiktok.com/@safa_uzb', defaultIcon: 'Globe' },
  { id: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/safa_uzb', defaultIcon: 'Globe' },
  { id: 'website', label: 'Official Website / Domain', placeholder: 'https://safa.uz', defaultIcon: 'Globe' },
  { id: 'other', label: 'Other Direct Link', placeholder: 'https://...', defaultIcon: 'Globe' }
];

export const AdminSocialTab: React.FC<AdminSocialTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [links, setLinks] = useState<SocialLink[]>(storage.getSocialLinks());
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<SocialLink, 'id'>>({
    platform: 'telegram',
    title: '',
    url: '',
    handle: '',
    description: '',
    enabled: true,
    displayOrder: links.length + 1
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const refreshList = () => {
    const updated = storage.getSocialLinks();
    setLinks(updated);
    onRefresh();
  };

  const validateUrl = (url: string, platform: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL or email address is required.');
      return false;
    }
    if (url.startsWith('javascript:')) {
      setUrlError('Unsafe URL protocol detected.');
      return false;
    }
    if (platform === 'email' || platform === 'gmail') {
      if (!url.startsWith('mailto:') && !url.includes('@')) {
        setUrlError('Email link should be in the format: mailto:youremail@domain.com');
        return false;
      }
    } else {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setUrlError('Web links must start with https:// or http://');
        return false;
      }
    }
    setUrlError(null);
    return true;
  };

  const handleStartCreate = () => {
    setEditingLink(null);
    setUrlError(null);
    setFormData({
      platform: 'telegram',
      title: 'Telegram Channel',
      url: 'https://t.me/',
      handle: '@',
      description: 'Official announcements and volunteer updates.',
      enabled: true,
      displayOrder: links.length + 1
    });
    setIsCreating(true);
  };

  const handleStartEdit = (link: SocialLink) => {
    setIsCreating(false);
    setUrlError(null);
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      title: link.title,
      url: link.url,
      handle: link.handle,
      description: link.description || '',
      enabled: link.enabled,
      displayOrder: link.displayOrder
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(formData.url, formData.platform)) {
      return;
    }

    if (editingLink) {
      storage.updateSocialLink(editingLink.id, formData, currentUser.name);
      showNotice(`Updated "${formData.title}" successfully!`);
    } else {
      storage.addSocialLink(formData, currentUser.name);
      showNotice(`Added "${formData.title}" to official channels!`);
    }

    setIsCreating(false);
    setEditingLink(null);
    refreshList();
  };

  const handleToggleEnable = (link: SocialLink) => {
    storage.updateSocialLink(link.id, { enabled: !link.enabled }, currentUser.name);
    showNotice(`${link.title} is now ${!link.enabled ? 'visible' : 'hidden'} on the website.`);
    refreshList();
  };

  const handleDelete = (link: SocialLink) => {
    if (window.confirm(`Are you sure you want to remove ${link.title} from official links?`)) {
      storage.deleteSocialLink(link.id, currentUser.name);
      showNotice(`Removed ${link.title}.`);
      refreshList();
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const reordered = [...links];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    storage.reorderSocialLinks(reordered.map(l => l.id), currentUser.name);
    showNotice('Channels reordered.');
    refreshList();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <Send className="w-4 h-4 text-[#229ED9]" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-[#E1306C]" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-[#FF0000]" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-[#0077B5]" />;
      case 'email':
      case 'gmail':
        return <Mail className="w-4 h-4 text-[#5E6E52]" />;
      default:
        return <Globe className="w-4 h-4 text-[#6D6A61]" />;
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Toast Notification */}
      {notice && (
        <div className="p-4 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>Centralized Communications</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Official Channels & Social Links
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Manage the centralized links displayed in the website header, footer, contact page, and public links directory (<span className="font-mono text-[#5E6E52]">/links</span>). Non-technical administrators can safely add, order, or hide channels without touching code.
          </p>
        </div>

        <Button
          onClick={handleStartCreate}
          variant="primary"
          size="md"
          className="shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Channel</span>
        </Button>
      </div>

      {/* Modal / Inline Editor */}
      {(isCreating || editingLink) && (
        <Card className="p-6 sm:p-8 bg-[#FDFCF9] border-2 border-[#5E6E52] rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                {editingLink ? `Edit Channel: ${editingLink.title}` : 'Add Official Channel'}
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Fill out the channel details. Changes are updated across the website immediately.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingLink(null);
              }}
              className="p-1.5 rounded-full text-[#6D6A61] hover:bg-[#F1EDE4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            {urlError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Platform / Type *
                </label>
                <select
                  value={formData.platform}
                  onChange={e => {
                    const plat = e.target.value as SocialPlatform;
                    const pDef = PLATFORMS.find(p => p.id === plat);
                    setFormData(prev => ({
                      ...prev,
                      platform: plat,
                      title: pDef ? pDef.label : prev.title
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36] focus:outline-[#5E6E52]"
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Telegram Official Channel"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36] focus:outline-[#5E6E52]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Destination URL or Mailto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={e => {
                    setFormData({ ...formData, url: e.target.value });
                    setUrlError(null);
                  }}
                  placeholder="https://t.me/SafaUzbekistan or mailto:safaauzb@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium font-mono text-[#3D3B36] focus:outline-[#5E6E52]"
                />
              </div>

              {/* Handle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                  Public Handle / Username
                </label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={e => setFormData({ ...formData, handle: e.target.value })}
                  placeholder="e.g. @SafaUzbekistan"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36] focus:outline-[#5E6E52]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1.5">
                Purpose / Description (Shown on /links directory)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of what visitors will find on this channel..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36] focus:outline-[#5E6E52]"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E5E0D5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E0D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E6E52]"></div>
              </label>
              <span className="text-xs font-semibold text-[#3D3B36]">
                {formData.enabled ? 'Channel is Active & Visible Publicly' : 'Channel is Hidden / Disabled'}
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingLink(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingLink ? 'Save Channel Changes' : 'Publish Channel'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Social Links Table / Card List */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6D6A61]">
            Active Channels ({links.filter(l => l.enabled).length} of {links.length})
          </div>
          <span className="text-xs text-[#6D6A61]">
            Use arrows to adjust order in navigation & footer
          </span>
        </div>

        <div className="divide-y divide-[#E5E0D5]">
          {links.map((link, idx) => (
            <div
              key={link.id}
              className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !link.enabled ? 'opacity-50 bg-[#F1EDE4]/20 p-3 rounded-2xl' : ''
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Order buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, 'up')}
                    className="p-1 rounded text-[#6D6A61] hover:bg-[#F1EDE4] disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === links.length - 1}
                    onClick={() => handleMoveOrder(idx, 'down')}
                    className="p-1 rounded text-[#6D6A61] hover:bg-[#F1EDE4] disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#F1EDE4] border border-[#E5E0D5] flex items-center justify-center shrink-0">
                  {getPlatformIcon(link.platform)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#3D3B36]">{link.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F1EDE4] text-[#6D6A61] border border-[#E5E0D5]">
                      {link.platform}
                    </span>
                    {!link.enabled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6D6A61]">
                    <span className="font-mono text-[#5E6E52]">{link.handle}</span>
                    <span>•</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 text-[#6D6A61] max-w-xs truncate"
                    >
                      {link.url} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  {link.description && (
                    <p className="text-xs text-[#6D6A61] mt-1 line-clamp-1">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleEnable(link)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    link.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {link.enabled ? 'Active' : 'Disabled'}
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartEdit(link)}
                  className="flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(link)}
                  className="text-red-600 hover:bg-red-50 p-2"
                  title="Delete Channel"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Live Preview Card */}
      <Card className="p-6 bg-[#F1EDE4]/40 border border-[#E5E0D5] rounded-3xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#B06D50]">
          Public Directory Preview (/links)
        </h4>
        <p className="text-xs text-[#6D6A61]">
          This is how users view your official verified channels on the live website:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {links.filter(l => l.enabled).map(l => (
            <div
              key={l.id}
              className="p-3.5 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#F1EDE4] flex items-center justify-center shrink-0">
                  {getPlatformIcon(l.platform)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#3D3B36] truncate">{l.title}</div>
                  <div className="text-[11px] font-mono text-[#5E6E52] truncate">{l.handle}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#9C988D] shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
