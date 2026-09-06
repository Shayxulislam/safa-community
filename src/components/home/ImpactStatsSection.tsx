import React from 'react';
import { ShieldCheck, HeartHandshake, Users, Sparkles, MapPin } from 'lucide-react';
import { storage } from '../../services/storage';
import { WHY_CHOOSE_SAFA } from '../../data/seedData';
import { SectionHeader } from '../ui/SectionHeader';

export const ImpactStatsSection: React.FC = () => {
  const stats = storage.getImpactStats();

  return (
    <section className="py-16 sm:py-24 bg-[#FDFCF9] border-b border-[#E5E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Database-Driven Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#6D6A61]">
              Verified impact statistics will be published here when available.
            </div>
          ) : stats.map((stat, idx) => (
            <div
              key={stat.id}
              className={`p-6 rounded-[2rem] border transition-all ${
                idx === 0
                  ? 'bg-[#C1E8FF] border-[#7DA0CA]'
                  : idx === 1
                  ? 'bg-white border-[#E5E0D5]'
                  : idx === 2
                  ? 'bg-[#C1E8FF]/60 border-[#7DA0CA]'
                  : 'bg-white border-[#E5E0D5]'
              } text-center hover:shadow-xs`}
            >
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#052659] tracking-tight mb-1">
                {stat.metric}
              </div>
              <div className="text-sm font-bold text-[#3D3B36] mb-1">
                {stat.label}
              </div>
              <p className="text-xs text-[#6D6A61] leading-relaxed mb-3">
                {stat.description}
              </p>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-[#052659] bg-white px-2.5 py-0.5 rounded-full border border-[#C1E8FF]">
                {stat.period}
              </span>
            </div>
          ))}
        </div>

        {/* Why Choose SAFA Section */}
        <SectionHeader
          badge="Our Mission & Trust"
          badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
          title="Why Choose SAFA?"
          description="A growing community bringing compassionate people together. We turn simple intentions into meaningful, local action."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_SAFA.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#6D6A61]">
              Verified programs and community outcomes will be added by the SAFA team.
            </div>
          ) : WHY_CHOOSE_SAFA.map((item, idx) => {
            const isFeaturedGreen = idx === 1; // youth-led card accent
            const isWarmSand = idx === 0;

            const getIcon = () => {
              const iconColor = isFeaturedGreen ? 'text-white' : 'text-[#5E6E52]';
              switch (item.id) {
                case 'reach':
                  return <Users className={`w-5 h-5 ${iconColor}`} />;
                case 'youth':
                  return <Sparkles className={`w-5 h-5 ${iconColor}`} />;
                case 'action':
                  return <HeartHandshake className={`w-5 h-5 ${iconColor}`} />;
                case 'community':
                  return <Users className={`w-5 h-5 ${iconColor}`} />;
                case 'impact':
                  return <MapPin className={`w-5 h-5 ${iconColor}`} />;
                default:
                  return <ShieldCheck className={`w-5 h-5 ${iconColor}`} />;
              }
            };

            return (
              <div
                key={item.id}
                className={`p-7 rounded-[2rem] transition-all ${
                  isFeaturedGreen
                    ? 'bg-[#5E6E52] text-white shadow-sm'
                    : isWarmSand
                    ? 'bg-[#F1EDE4] border border-[#E5E0D5] text-[#3D3B36]'
                    : 'bg-white border border-[#E5E0D5] text-[#3D3B36] shadow-2xs hover:border-[#D5CFC3]'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isFeaturedGreen ? 'bg-white/20' : 'bg-[#F1EDE4] border border-[#E5E0D5]'
                    }`}
                  >
                    {getIcon()}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isFeaturedGreen
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-[#B06D50] border border-[#E5E0D5]'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <h3
                  className={`text-xl font-serif font-bold mb-2 ${
                    isFeaturedGreen ? 'text-white italic' : 'text-[#3D3B36]'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isFeaturedGreen ? 'text-white/85' : 'text-[#6D6A61]'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
