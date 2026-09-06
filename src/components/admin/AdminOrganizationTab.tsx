import React, { useState } from 'react';
import {
  Building2,
  User,
  Heart,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Globe,
  Quote,
  Compass,
  Eye,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { FounderProfile, User as UserType } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SafaLogo } from '../ui/SafaLogo';

interface AdminOrganizationTabProps {
  currentUser: UserType;
  onRefresh: () => void;
}

export const AdminOrganizationTab: React.FC<AdminOrganizationTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [profile, setProfile] = useState<FounderProfile>(storage.getFounderProfile());
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedLogo, setCopiedLogo] = useState(false);

  const handleCopyLogo = () => {
    navigator.clipboard.writeText(window.location.origin + '/logo.png');
    setCopiedLogo(true);
    setTimeout(() => setCopiedLogo(false), 2000);
  };

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateFounderProfile(profile, currentUser.name);
    showNotice('Organization & Founder profile saved successfully!');
    onRefresh();
  };

  return (
    <div className="space-y-8 text-left">
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
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization & Leadership</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Organization Info & Founder Profile
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Manage official organization data, the leadership profile, mission, vision, and core contact credentials. Updates are reflected across the website automatically.
          </p>
        </div>
      </div>

      {/* Section: Official SAFA Brand Assets & Logo */}
      <Card className="p-6 sm:p-8 bg-white border border-[#BFDBFE] rounded-3xl shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FC] text-[#0056D2] flex items-center justify-center p-1 border border-[#BFDBFE]">
              <SafaLogo variant="mark" size={24} color="#0056D2" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#172033]">
                Official Brand Logo & Slogan
              </h3>
              <p className="text-xs text-[#64748B]">
                "Connecting Hands, Changing Lives" — Heart, Reaching Hands & Dove of Hope
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#BFDBFE] bg-[#EBF3FC] text-[#0056D2] hover:bg-[#D8E9F9] text-xs font-semibold transition-colors"
            >
              {copiedLogo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLogo ? 'Copied URL!' : 'Copy Vector Link'}</span>
            </button>
            <a
              href="/logo.png"
              download="logo.png"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0056D2] text-white hover:bg-[#0046B0] text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <div className="w-44 h-44 flex items-center justify-center mb-2">
              <SafaLogo variant="full" size={170} />
            </div>
            <p className="text-[11px] font-mono text-[#64748B]">
              Primary Logo Image: /logo.png
            </p>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] px-2 py-0.5 rounded-full bg-[#EBF3FC] border border-[#BFDBFE]">
                Official Typography & Slogan
              </span>
              <h4 className="text-xl font-serif font-black text-[#172033] pt-1">
                CONNECTING HANDS, CHANGING LIVES.
              </h4>
              <p className="text-xs text-[#64748B]">
                Displayed in arced upper banner and across all national community programs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Brand Color</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-4 h-4 rounded-full bg-[#0056D2] inline-block border border-white shadow-2xs" />
                  <span className="text-xs font-mono font-bold text-[#172033]">#0056D2</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Canvas Soft Tint</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-4 h-4 rounded-full bg-[#EBF3FC] inline-block border border-[#BFDBFE]" />
                  <span className="text-xs font-mono font-bold text-[#172033]">#EBF3FC</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EBF3FC]/60 border border-[#BFDBFE] text-xs text-[#1E40AF]">
              <strong>Live Deployment:</strong> The official emblem is active across the site navbar, mobile navigation, global footer, official channels directory, and browser favicon.
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Leadership Profile */}
        <Card className="p-6 sm:p-8 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-4">
            <User className="w-5 h-5 text-[#5E6E52]" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                Founder & CEO Profile
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Information displayed on the About page and leadership sections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview and Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36]">
                Profile / Leadership Photo
              </label>
              <div className="w-full aspect-square rounded-2xl bg-[#F1EDE4] border border-[#E5E0D5] overflow-hidden flex items-center justify-center relative shadow-inner">
                {profile.imageUrl || profile.image ? (
                  <img
                    src={profile.imageUrl || profile.image || '/ceo.png'}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/ceo.png';
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-[#9C988D]" />
                )}
              </div>
              <input
                type="text"
                value={profile.imageUrl || profile.image || ''}
                onChange={e => setProfile({ ...profile, imageUrl: e.target.value, image: e.target.value })}
                    placeholder="/ceo.png or image URL"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
              />
              <p className="text-[11px] text-[#6D6A61]">
                    Default is <span className="font-mono">/ceo.png</span>.
              </p>
            </div>

            {/* Name and Titles */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                    Leader Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                    Official Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.title || profile.role || ''}
                    onChange={e => setProfile({ ...profile, title: e.target.value, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Organization Entity Name
                </label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={e => setProfile({ ...profile, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Guiding Quote
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 text-[#B06D50] absolute left-3 top-3 opacity-60" />
                  <input
                    type="text"
                    value={profile.quote}
                    onChange={e => setProfile({ ...profile, quote: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs italic text-[#3D3B36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Full Biography & Background
                </label>
                <textarea
                  rows={4}
                  value={profile.biography || profile.bio || ''}
                  onChange={e => setProfile({ ...profile, biography: e.target.value, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs leading-relaxed text-[#3D3B36]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Mission, Vision, and About SAFA */}
        <Card className="p-6 sm:p-8 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-4">
            <Compass className="w-5 h-5 text-[#5E6E52]" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                Mission, Vision & About Narrative
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Core founding principles displayed on the Mission & Values and About pages.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Mission Statement
              </label>
              <textarea
                rows={2}
                value={profile.mission || ''}
                onChange={e => setProfile({ ...profile, mission: e.target.value })}
                placeholder="Connecting hands, changing lives..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Vision Statement
              </label>
              <textarea
                rows={2}
                value={profile.vision || ''}
                onChange={e => setProfile({ ...profile, vision: e.target.value })}
                placeholder="A dignified, inclusive society..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                About SAFA Overview Text
              </label>
              <textarea
                rows={4}
                value={profile.aboutText || ''}
                onChange={e => setProfile({ ...profile, aboutText: e.target.value })}
                placeholder="SAFA is a youth-led community and charity initiative in Uzbekistan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs leading-relaxed text-[#3D3B36]"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Official Contact Information */}
        <Card className="p-6 sm:p-8 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-4">
            <Mail className="w-5 h-5 text-[#5E6E52]" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                Official Contact & Location Details
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Official address, email, and phone shown on the Contact page and Footer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={profile.email || 'safaauzb@gmail.com'}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={profile.address || 'Tashkent, Republic of Uzbekistan'}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" variant="primary" size="lg">
            Save All Organization Details
          </Button>
        </div>
      </form>
    </div>
  );
};
