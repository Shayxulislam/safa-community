import React from 'react';
import { Quote, Send, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';

export const FounderSection: React.FC = () => {
  const founder = storage.getFounderProfile();
  const founderName = founder.name || 'Nargiza';
  const founderTitle = founder.title || founder.role || 'CEO & Founder';
  const founderOrganization = founder.organization || 'SAFA';
  const founderQuote = founder.quote || 'CEO of SAFA — turning compassion into meaningful action. Nargiza leads the vision behind every visit, drive, and connection SAFA makes.';
  const founderBiography = founder.biography || founder.bio || 'Nargiza leads SAFA with the conviction that empathy must be paired with action. Mobilizing youth and community volunteers across Tashkent and regional mahallas.';
  const founderImage = founder.imageUrl || founder.image || '/ceo.png';

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#C1E8FF]/45 rounded-[2.5rem] border border-[#C1E8FF] shadow-xs overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Founder Portrait with Natural Sand framing */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[360px]">
                <div className="relative overflow-hidden rounded-[2rem] shadow-lg border-2 border-white/60 bg-[#EAE7DF]">
                  <img
                    src={founderImage}
                    alt={`Portrait of ${founderName}, ${founderTitle}`}
                    className="block w-full h-auto max-h-[480px] object-contain object-top"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/ceo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D3B36]/60 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Official Title Tag */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#052659] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap flex items-center gap-1.5 border border-white/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F1EDE4]" />
                  <span>CEO &amp; Founder</span>
                </div>
              </div>
            </div>

            {/* Quote and Leadership Narrative */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white text-[#B06D50] border border-[#E5E0D5] mb-4 shadow-2xs">
                <span>Organizational Leadership</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight mb-1">
                {founderName}
              </h2>
              <p className="text-xs font-bold text-[#B06D50] uppercase tracking-widest mb-6">
                {founderTitle} • {founderOrganization}
              </p>

              {/* Founder Quote in Warm Stone Card */}
              <div className="relative p-6 rounded-[2rem] bg-white/90 backdrop-blur-md border border-[#E5E0D5] shadow-xs mb-6">
                <Quote className="w-7 h-7 text-[#5E6E52]/25 absolute top-5 right-5" />
                <p className="text-base sm:text-lg font-serif italic text-[#3D3B36] leading-relaxed relative z-10">
                  “{founderQuote}”
                </p>
              </div>

              {/* Approved Biography */}
              <p className="text-sm sm:text-base text-[#6D6A61] leading-relaxed mb-6">
                {founderBiography}
              </p>

              {/* Direct Leadership Links */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E5E0D5]">
                {founder.telegramUrl && (
                  <a
                    href={founder.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FDFCF9] text-[#5E6E52] border border-[#E5E0D5] text-xs font-bold transition-all shadow-2xs focus-visible:outline-[#5E6E52]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Channel</span>
                  </a>
                )}
                {founder.linkedinUrl && (
                  <a
                    href={founder.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FDFCF9] text-[#5E6E52] border border-[#E5E0D5] text-xs font-bold transition-all shadow-2xs focus-visible:outline-[#5E6E52]"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {founder.email && (
                  <a
                    href={`mailto:${founder.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FDFCF9] text-[#5E6E52] border border-[#E5E0D5] text-xs font-bold transition-all shadow-2xs focus-visible:outline-[#5E6E52]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Leadership</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
