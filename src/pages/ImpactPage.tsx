import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, CheckCircle2, HeartHandshake, MapPin, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { WHY_CHOOSE_SAFA } from '../data/seedData';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ImpactPage: React.FC = () => {
  const stats = storage.getImpactStats();
  const programs = storage.getPrograms();

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Verified Impact"
          badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          title="Measurable Results. Real Human Outcomes."
          description="At SAFA, every statistic published is verified through field registers and direct volunteer documentation. We never fabricate numbers."
        />

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#64748B]">
              Verified impact statistics will be published here when available.
            </div>
          ) : stats.map(stat => (
            <Card key={stat.id} className="p-6 text-center">
              <div className="text-4xl font-extrabold text-[#0D47A1] mb-2 tracking-tight">
                {stat.metric}
              </div>
              <h3 className="text-sm font-bold text-[#172033] mb-2">
                {stat.label}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                {stat.description}
              </p>
              <span className="inline-block text-[11px] font-semibold text-[#1565C0] bg-[#EAF4FF] px-2.5 py-1 rounded-full">
                {stat.period}
              </span>
            </Card>
          ))}
        </div>

        {/* Why Choose SAFA Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#172033] mb-6">
            Core Differentiators of Our Community Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_SAFA.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#64748B]">
                Verified programs and community outcomes will be added by the SAFA team.
              </div>
            ) : WHY_CHOOSE_SAFA.map(item => (
              <Card key={item.id} className="p-6">
                <span className="text-xs font-bold text-[#0D47A1] bg-[#EAF4FF] px-2.5 py-0.5 rounded-full inline-block mb-3">
                  {item.tag}
                </span>
                <h4 className="text-lg font-bold text-[#172033] mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Reach Breakdown by Program */}
        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-xs mb-16">
          <h3 className="text-xl font-bold text-[#172033] mb-6">
            Field Reach by Program Line
          </h3>
          <div className="space-y-4">
            {programs.map(prog => (
              <div key={prog.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">{prog.category}</span>
                  <h4 className="text-sm font-bold text-[#172033]">{prog.title}</h4>
                  <p className="text-xs text-[#64748B]">{prog.location}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534]">
                    {prog.peopleHelped || 'Active Community Focus'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <Link to="/work">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Examine Verified Project Documentation in "Piece of Our Work"
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
