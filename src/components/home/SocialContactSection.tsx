import React, { useState } from 'react';
import { Send, Instagram, Mail, Linkedin, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const SocialContactSection: React.FC = () => {
  const socials = storage.getSocialLinks().filter(s => s.enabled);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <Send className="w-5 h-5 text-[#5E6E52]" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-[#B06D50]" />;
      case 'gmail':
        return <Mail className="w-5 h-5 text-[#B06D50]" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-[#5E6E52]" />;
      default:
        return <Send className="w-5 h-5 text-[#5E6E52]" />;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F1EDE4]/30 border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Official Channels & Contact"
          title="Connect Directly with SAFA Uzbekistan"
          description="Follow our verified social spaces for real-time announcements, volunteer meetups, and behind-the-scenes community drives."
        />

        {/* 4 Official Links as Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {socials.map(social => (
            <Card key={social.id} hover className="p-6 flex flex-col justify-between text-left h-full bg-white border border-[#E5E0D5] rounded-[2rem]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#F1EDE4] border border-[#E5E0D5] flex items-center justify-center">
                    {getPlatformIcon(social.platform)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6E52] bg-[#F1EDE4] border border-[#E5E0D5] px-2.5 py-0.5 rounded-full">
                    Official
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#3D3B36] mb-1">
                  {social.title}
                </h3>
                <p className="text-xs font-mono font-medium text-[#5E6E52] mb-3 break-all">
                  {social.handle}
                </p>
                <p className="text-xs text-[#6D6A61] leading-relaxed mb-6">
                  {social.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E0D5] flex items-center gap-2">
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5E6E52] text-white text-xs font-bold hover:bg-[#4a5840] transition-colors shadow-2xs focus-visible:outline-[#5E6E52]"
                >
                  <span>Open {social.platform}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(social.url, social.id)}
                  className="p-2.5 rounded-xl border border-[#E5E0D5] text-[#6D6A61] hover:text-[#3D3B36] hover:bg-[#F1EDE4] transition-colors"
                  title="Copy link"
                  aria-label={`Copy ${social.title} link`}
                >
                  {copiedId === social.id ? (
                    <Check className="w-4 h-4 text-[#5E6E52]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Route to Contact or Volunteer Form */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-[#E5E0D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div>
            <h4 className="text-xl font-serif font-bold text-[#3D3B36] mb-1">
              Have a Specific Question or Community Need?
            </h4>
            <p className="text-sm text-[#6D6A61]">
              Reach our field coordinators directly via our secure contact portal or join our youth volunteer network.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/contact">
              <Button variant="outline" size="md">
                Send a Message
              </Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Join as Volunteer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
