import React, { useState } from 'react';
import { Send, Instagram, Mail, Linkedin, Youtube, Globe, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { SafaLogo } from '../components/ui/SafaLogo';

export const LinksPage: React.FC = () => {
  const socials = storage.getSocialLinks().filter(s => s.enabled);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'telegram':
        return <Send className="w-7 h-7 text-[#229ED9]" />;
      case 'instagram':
        return <Instagram className="w-7 h-7 text-[#E1306C]" />;
      case 'youtube':
        return <Youtube className="w-7 h-7 text-[#FF0000]" />;
      case 'email':
      case 'gmail':
        return <Mail className="w-7 h-7 text-[#5E6E52]" />;
      case 'linkedin':
        return <Linkedin className="w-7 h-7 text-[#0077B5]" />;
      default:
        return <Globe className="w-7 h-7 text-[#6D6A61]" />;
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FDFCF9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Official Brand Crest */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-white border border-[#BFDBFE] p-3 flex items-center justify-center shadow-xs">
            <SafaLogo variant="mark" size={56} color="#0056D2" />
          </div>
        </div>

        <SectionHeader
          badge="Verified Directory"
          badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          title="Official SAFA Channels & Links"
          description="Access all authorized social spaces, public channels, and official communication points for SAFA Uzbekistan in one place."
        />

        <div className="space-y-6 mb-16">
          {socials.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#BFDBFE] bg-white p-10 text-center text-sm text-[#6D6A61]">
              Verified channel buttons will appear here when published by the SAFA team.
            </div>
          ) : socials.map(item => {
            const isEmail = item.platform === 'email' || item.platform === 'gmail' || item.url.startsWith('mailto:');

            return (
            <Card key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white border border-[#E5E0D5] rounded-[2rem] shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F1EDE4] border border-[#E5E0D5] flex items-center justify-center shrink-0">
                  {getPlatformIcon(item.platform)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-serif font-bold text-[#3D3B36]">{item.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F1EDE4] text-[#5E6E52] border border-[#E5E0D5] px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#5E6E52] mb-2 break-all">
                    {item.handle}
                  </p>
                  <p className="text-xs text-[#6D6A61] max-w-md">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={item.url}
                  target={isEmail ? undefined : '_blank'}
                  rel={isEmail ? undefined : 'noopener noreferrer'}
                  className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E6E52] text-white text-xs font-bold hover:bg-[#4a5840] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E6E52]"
                >
                  <span>{isEmail ? 'Send email' : `Open ${item.platform}`}</span>
                  {isEmail ? <Mail className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="p-2.5 rounded-xl border border-[#E5E0D5] text-[#6D6A61] hover:text-[#3D3B36] hover:bg-[#F1EDE4] transition-colors"
                  title="Copy link"
                  aria-label={`Copy link for ${item.title}`}
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-[#5E6E52]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Card>
            );
          })}
        </div>

        {/* Security and impersonation advisory */}
        <div className="p-6 sm:p-8 rounded-[2rem] bg-[#F1EDE4]/50 border border-[#E5E0D5] shadow-xs text-xs text-[#6D6A61] leading-relaxed">
          <h4 className="text-sm font-serif font-bold text-[#3D3B36] mb-2">Anti-Fraud & Impersonation Advisory</h4>
          <p className="mb-2">
            SAFA will never direct message individuals from private personal accounts asking for cryptocurrency, credit card passwords, or unauthorized personal bank accounts.
          </p>
          <p>
            Always verify that communication originates from <strong className="text-[#3D3B36]">safaauzb@gmail.com</strong>, our official Telegram channel <strong className="text-[#3D3B36]">@SafaUzbekistan</strong>, or our verified Instagram <strong className="text-[#3D3B36]">@safa_uzb_</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
