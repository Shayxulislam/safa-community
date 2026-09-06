import React from 'react';
import { Quote, Send, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';

export const FounderSection: React.FC = () => {
  const founder = storage.getFounderProfile();

  if (!founder.name) {
    return (
      <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] border border-[#BFDBFE] bg-[#C1E8FF]/25 p-8 sm:p-10 text-center">
            <img
              src="/ceo.png"
              alt="SAFA CEO"
              className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 aspect-square rounded-2xl object-cover object-top border-4 border-white shadow-sm mx-auto mb-5"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5E6E52]">CEO Profile</span>
            <p className="max-w-sm mx-auto text-sm text-[#6D6A61] mt-3">
              Verified leadership information will be published here by the SAFA team.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#C1E8FF]/45 rounded-[2.5rem] border border-[#C1E8FF] shadow-xs overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Founder Portrait with Natural Sand framing */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-lg border-2 border-white/60 bg-[#EAE7DF]">
                  <img
                    src={founder.imageUrl || founder.image || '/ceo.png'}
                    alt={`Portrait of ${founder.name}, ${founder.title || founder.role}`}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/ceo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D3B36]/60 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Official Title Tag */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#5E6E52] text-white px-4.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap flex items-center gap-1.5 border border-white/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F1EDE4]" />
                  <span>Verified Leadership</span>
                </div>
              </div>
            </div>

            {/* Quote and Leadership Narrative */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white text-[#B06D50] border border-[#E5E0D5] mb-4 shadow-2xs">
                <span>Organizational Leadership</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight mb-1">
                {founder.name}
              </h2>
              <p className="text-xs font-bold text-[#B06D50] uppercase tracking-widest mb-6">
                {founder.title || founder.role} • {founder.organization}
              </p>

              {/* Founder Quote in Warm Stone Card */}
              <div className="relative p-6 rounded-[2rem] bg-white/90 backdrop-blur-md border border-[#E5E0D5] shadow-xs mb-6">
                <Quote className="w-7 h-7 text-[#5E6E52]/25 absolute top-5 right-5" />
                <p className="text-base sm:text-lg font-serif italic text-[#3D3B36] leading-relaxed relative z-10">
                  "{founder.quote}"
                </p>
              </div>

              {/* Approved Biography */}
              <p className="text-sm sm:text-base text-[#6D6A61] leading-relaxed mb-6">
                {founder.biography || founder.bio}
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
