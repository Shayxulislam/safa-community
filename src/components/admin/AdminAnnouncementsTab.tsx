import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Power
} from 'lucide-react';
import { Announcement, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AdminAnnouncementsTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const announcements = storage.getAnnouncements();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Announcement['type']>('info');
  const [linkUrl, setLinkUrl] = useState('/support');
  const [linkText, setLinkText] = useState('Support Drive');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    storage.toggleAnnouncement(id, !currentActive, currentUser.name);
    onRefresh();
    showNotice(`Announcement ${!currentActive ? 'activated on website' : 'deactivated'}.`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      storage.deleteAnnouncement(id, currentUser.name);
      onRefresh();
      showNotice('Announcement deleted.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      active: true,
      linkUrl: linkUrl.trim() || undefined,
      linkText: linkText.trim() || undefined,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    storage.saveAnnouncement(newAnn, currentUser.name);
    setIsModalOpen(false);
    onRefresh();
    showNotice(`Announcement "${newAnn.title}" published and activated site-wide!`);
  };

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Bell className="w-4 h-4" />
            <span>Site-Wide Notice System</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Site-Wide Announcements & Banners
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Broadcast urgent emergency drives, holiday announcements, and event alerts across all pages of the SAFA website.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setTitle('');
            setMessage('');
            setType('info');
            setLinkUrl('/support');
            setLinkText('Support Drive');
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          + New Announcement
        </Button>
      </div>

      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        {announcements.length === 0 ? (
          <p className="text-xs text-[#6D6A61] py-8 text-center">No announcements created yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  ann.active
                    ? 'bg-[#FDFCF9] border-[#B06D50]/40 ring-1 ring-[#B06D50]/30'
                    : 'bg-[#F1EDE4]/40 border-[#E5E0D5] opacity-75'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ann.type === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : ann.type === 'alert'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ann.type}
                    </span>
                    <span className="font-bold text-sm text-[#3D3B36]">{ann.title}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-sm ${
                      ann.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {ann.active ? 'Active On Site' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-[#6D6A61] leading-relaxed max-w-2xl">
                    {ann.message}
                  </p>

                  {ann.linkUrl && (
                    <div className="text-[11px] text-[#5E6E52] flex items-center gap-1 font-semibold">
                      <ExternalLink className="w-3 h-3" />
                      <span>Destination: {ann.linkText || ann.linkUrl}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <Button
                    size="sm"
                    variant={ann.active ? 'secondary' : 'outline'}
                    onClick={() => handleToggle(ann.id, ann.active)}
                    icon={<Power className="w-3.5 h-3.5" />}
                  >
                    {ann.active ? 'Turn Off' : 'Activate Live'}
                  </Button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 rounded-lg text-[#6D6A61] hover:text-red-700 hover:bg-red-50"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Site-Wide Announcement Banner"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Banner Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Urgent Winter Warmth Drive"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Banner Message *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Brief message displayed in the top bar of the website..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Notice Style
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="info">Info (Blue/Subtle)</option>
                <option value="alert">Alert (Warm Terracotta)</option>
                <option value="urgent">Urgent Emergency (Red)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Button Text
              </label>
              <input
                type="text"
                placeholder="e.g. Learn More / Donate"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Target Link URL
            </label>
            <input
              type="text"
              placeholder="/support or https://t.me/SafaUzbekistan"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save & Activate Live
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
