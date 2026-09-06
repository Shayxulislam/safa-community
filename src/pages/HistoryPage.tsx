import React from 'react';
import { Calendar, CheckCircle2, Award, Users, Heart } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

export const HistoryPage: React.FC = () => {
  const milestones = storage.getMilestones();

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Journey & Growth"
          badgeIcon={<Award className="w-3.5 h-3.5" />}
          title="History & Milestones of SAFA"
          description="How a small group of committed students and young people created an organized community movement spanning hundreds of families."
        />

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-[#1565C0]/20 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-12 mb-16">
          {milestones.map((m, idx) => (
            <div key={m.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-[#1565C0] border-4 border-white shadow-xs flex items-center justify-center text-white">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <Card className="p-6 transition-all hover:border-[#1565C0]/40">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#0D47A1] bg-[#EAF4FF] px-2.5 py-0.5 rounded-full">
                    {m.year}
                  </span>
                  {m.impactStat && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {m.impactStat}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#172033] mb-2">
                  {m.title}
                </h3>

                <p className="text-sm text-[#64748B] leading-relaxed">
                  {m.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* Future Vision */}
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-xs text-center">
          <Heart className="w-8 h-8 text-[#1565C0] mx-auto mb-3" />
          <h3 className="text-xl font-bold text-[#172033] mb-2">Looking Ahead: 2026 and Beyond</h3>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Our goal remains constant: building decentralized, autonomous youth squads in every district to ensure no elder sits forgotten and no barrier limits our neighbors.
          </p>
        </div>
      </div>
    </div>
  );
};
