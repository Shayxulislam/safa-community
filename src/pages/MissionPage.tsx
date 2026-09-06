import React from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, Heart, Home, GraduationCap, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const MissionPage: React.FC = () => {
  const missionAreas = [
    {
      icon: <Accessibility className="w-6 h-6 text-[#1565C0]" />,
      title: 'Supporting People with Disabilities',
      description:
        'Removing structural barriers in neighborhood entrances, constructing safe concrete ramps, and supplying customized mobility aids so people can participate freely in community life.'
    },
    {
      icon: <Heart className="w-6 h-6 text-[#1565C0]" />,
      title: 'Supporting Elderly People Living Independently',
      description:
        'Combating loneliness and neglect through weekly social companion visits, grocery and nutrition hampers, and medical prescription coordination.'
    },
    {
      icon: <Home className="w-6 h-6 text-[#1565C0]" />,
      title: 'Supporting Vulnerable & Low-Income Families',
      description:
        'Targeted assistance for households experiencing seasonal crises, breadwinner illnesses, or severe living conditions with food baskets and winter warmth provisions.'
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-[#1565C0]" />,
      title: 'Educational Support & Youth Development',
      description:
        'Equipping schoolchildren with quality study stationery and backpacks, alongside peer mentorship from university students.'
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-[#1565C0]" />,
      title: 'Emergency Seasonal Community Relief',
      description:
        'Rapid mobilization during cold spells or emergency medical situations with verified documentation and immediate volunteer delivery.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Mission & Scope"
          title="Practical Relief Where It Matters Most"
          description="SAFA exists to deliver honest, responsible support across five core community areas, upholding human dignity at every step."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {missionAreas.map((area, idx) => (
            <Card key={idx} hover className="p-8 flex flex-col text-left">
              <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] flex items-center justify-center mb-5">
                {area.icon}
              </div>
              <h3 className="text-xl font-bold text-[#172033] mb-3">
                {area.title}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed flex-grow">
                {area.description}
              </p>
              <div className="pt-5 mt-5 border-t border-[#E2E8F0]">
                <Link to="/programs" className="text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] inline-flex items-center gap-1">
                  <span>Explore Program Execution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Commitment to Non-Fabrication */}
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-xs mb-16">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#172033] mb-2">
                Authenticity & Strict Scope Policy
              </h4>
              <p className="text-sm text-[#64748B] leading-relaxed mb-3">
                SAFA will never claim services or statistics that do not exist in reality. All programs listed are active or under formal development by our team. If a program is upcoming or awaiting resources, it is clearly noted. Every claim is subject to administrator and community verification.
              </p>
              <Link to="/transparency" className="text-xs font-bold text-[#0D47A1] hover:underline">
                Read our transparency and audit procedures →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
