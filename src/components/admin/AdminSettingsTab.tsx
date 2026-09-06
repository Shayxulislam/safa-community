import React, { useState } from 'react';
import { Settings, CheckCircle2, User, Globe, BarChart2, Download, FileCode, FolderArchive, Terminal } from 'lucide-react';
import { FounderProfile, SocialLink, ImpactStatistic, User as UserType } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminSettingsTabProps {
  currentUser: UserType;
  onRefresh: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const founder = storage.getFounderProfile();
  const socials = storage.getSocialLinks();
  const stats = storage.getImpactStats();

  const [founderForm, setFounderForm] = useState<FounderProfile>(founder);
  const [socialsList, setSocialsList] = useState<SocialLink[]>(socials);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveFounder = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateFounderProfile(founderForm, currentUser.name);
    onRefresh();
    showNotice('Founder profile updated!');
  };

  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSocialLinks(socialsList, currentUser.name);
    onRefresh();
    showNotice('Official channel links updated!');
  };

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Organizational Settings
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Update founder leadership profile, official social channels, and public impact metrics.
          </p>
        </div>
      </div>

      {/* Project Source Code & Archive Download Card */}
      <Card className="p-6 bg-[#FDFCF9] border-2 border-[#BFDBFE] rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF3FC] text-[#0056D2] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#172033]">
                Full Project Source Code (ZIP Archive)
              </h3>
              <p className="text-xs text-[#64748B]">
                Complete production codebase: React 19, TypeScript, Tailwind CSS, Express backend, vector logo, and assets.
              </p>
            </div>
          </div>

          <a
            href="/safa-community-platform.zip"
            download="safa-community-platform.zip"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0056D2] text-white hover:bg-[#0046B0] text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Project ZIP</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
            <span className="font-bold text-[#172033] block mb-1">Local Quickstart</span>
            <code className="text-[11px] font-mono text-[#0056D2] block bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E2E8F0]">
              npm install && npm run dev
            </code>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
            <span className="font-bold text-[#172033] block mb-1">Production Build</span>
            <code className="text-[11px] font-mono text-[#0056D2] block bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E2E8F0]">
              npm run build && npm start
            </code>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
            <span className="font-bold text-[#172033] block mb-1">AI Studio Export</span>
            <span className="text-[11px] text-[#64748B]">
              You can also export anytime via AI Studio top menu → <strong>Export to ZIP</strong>.
            </span>
          </div>
        </div>
      </Card>

      {/* Founder Profile Form */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#3D3B36] flex items-center gap-2">
          <User className="w-4 h-4 text-[#5E6E52]" />
          Founder & Leadership Profile
        </h3>

        <form onSubmit={handleSaveFounder} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Founder Name</label>
              <input
                type="text"
                value={founderForm.name}
                onChange={e => setFounderForm({ ...founderForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Role Title</label>
              <input
                type="text"
                value={founderForm.role}
                onChange={e => setFounderForm({ ...founderForm, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Photo URL</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F1EDE4] border border-[#E5E0D5] shrink-0">
                <img
                  src={founderForm.image || founderForm.imageUrl || '/ceo.png'}
                  alt={founderForm.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/ceo.png';
                  }}
                />
              </div>
              <input
                type="text"
                value={founderForm.image || founderForm.imageUrl || ''}
                onChange={e => setFounderForm({ ...founderForm, image: e.target.value, imageUrl: e.target.value })}
                    placeholder="/ceo.png"
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Guiding Quote</label>
            <input
              type="text"
              value={founderForm.quote}
              onChange={e => setFounderForm({ ...founderForm, quote: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Biography</label>
            <textarea
              rows={4}
              value={founderForm.bio}
              onChange={e => setFounderForm({ ...founderForm, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Update Founder Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Social Links List */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#3D3B36] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#5E6E52]" />
          Official Community Channels
        </h3>

        <form onSubmit={handleSaveSocials} className="space-y-3 text-xs">
          {socialsList.map((link, idx) => (
            <div key={link.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#F1EDE4]/50 border border-[#E5E0D5]">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6D6A61] mb-1">Platform</label>
                <input
                  type="text"
                  value={link.platform}
                  onChange={e => {
                    const updated = [...socialsList];
                    updated[idx].platform = e.target.value;
                    setSocialsList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-[#E5E0D5] bg-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6D6A61] mb-1">Handle / Label</label>
                <input
                  type="text"
                  value={link.handle}
                  onChange={e => {
                    const updated = [...socialsList];
                    updated[idx].handle = e.target.value;
                    setSocialsList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-[#E5E0D5] bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6D6A61] mb-1">URL</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={e => {
                    const updated = [...socialsList];
                    updated[idx].url = e.target.value;
                    setSocialsList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 border rounded-lg border-[#E5E0D5] bg-white"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Channel Links
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
