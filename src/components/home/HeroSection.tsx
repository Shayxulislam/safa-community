import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { SafaLogo } from '../ui/SafaLogo';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#021024] via-[#052659] to-[#5483B3] text-white py-16 sm:py-24 border-b border-[#5483B3]">
      {/* Subtle decorative background accents */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-[#C1E8FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-1/3 w-96 h-96 bg-[#7DA0CA]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C1E8FF]/15 border border-[#C1E8FF]/40 text-[#C1E8FF] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C1E8FF]" />
              <span>Youth-Led Community Support in Uzbekistan</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-[1.12] mb-6">
              Connecting Hands, <br />
              <span className="italic text-[#C1E8FF]">Changing Lives.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#C1E8FF] leading-relaxed mb-8 max-w-2xl">
              SAFA brings together compassionate young volunteers and local communities to turn empathy into direct, practical action. From hospital visits and winter warmth drives to home accessibility ramps, we support those who need it most.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              <Link to="/support">
                <Button variant="primary" size="lg" icon={<Heart className="w-5 h-5 fill-white" />} className="w-full sm:w-auto shadow-sm">
                  Support Our Mission
                </Button>
              </Link>
              <Link to="/work">
                <Button variant="outline" size="lg" icon={<ArrowRight className="w-4 h-4" />} className="w-full sm:w-auto">
                  See Our Work
                </Button>
              </Link>
            </div>

            {/* Verification badges */}
            <div className="pt-6 border-t border-[#7DA0CA]/60 flex flex-wrap items-center gap-6 text-xs text-[#C1E8FF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C1E8FF]" />
                <span className="font-semibold text-white">100% Verified Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C1E8FF]" />
                <span className="font-semibold text-white">Youth-Led Team</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C1E8FF]" />
                <span className="font-semibold text-white">Verified updates published by SAFA</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card with Verified Work highlights */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl border border-[#E5E0D5] bg-white">
                <div className="w-full h-80 bg-[#EAF4FF] flex items-center justify-center p-8 text-center text-sm text-[#64748B]">
                  Authentic SAFA field photography will be published here when available.
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5]">
                      Latest Grassroots Initiative
                    </span>
                    <span className="text-xs text-[#6D6A61]">Verified Record</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#3D3B36] mb-2 leading-snug">
                    Winter Warmth & Direct Mahalla Food Deliveries
                  </h3>
                  <p className="text-sm text-[#6D6A61] leading-relaxed mb-4">
                    Providing warm coats, solid fuels, and essential groceries to 45 vulnerable households in Tashkent.
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D5] text-xs">
                    <span className="text-[#6D6A61]">Action Reference:</span>
                    <span className="font-mono font-semibold text-[#5E6E52]">SAFA-2026-WORK01</span>
                  </div>
                </div>
              </div>

              {/* Floating trust badge with authentic SAFA Emblem */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-3 border border-[#BFDBFE] flex items-center gap-3 max-w-[260px]">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] text-[#0056D2] flex items-center justify-center shrink-0 border border-[#BFDBFE] p-1">
                  <SafaLogo variant="mark" size={28} color="#0056D2" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#172033]">SAFA Verified Field Action</p>
                  <p className="text-[11px] text-[#64748B]">Connecting Hands, Changing Lives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
