import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Accessibility, HeartHandshake, Home, GraduationCap, AlertCircle, Heart } from 'lucide-react';
import { storage } from '../../services/storage';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

export const MissionSection: React.FC = () => {
  const programs = storage.getPrograms();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'accessibility':
        return <Accessibility className="w-4 h-4 text-[#5E6E52]" />;
      case 'elderly care':
        return <Heart className="w-4 h-4 text-[#5E6E52]" />;
      case 'family assistance':
        return <Home className="w-4 h-4 text-[#5E6E52]" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-[#5E6E52]" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-[#5E6E52]" />;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Our Mission Areas"
          title="Where SAFA Takes Direct Action"
          description="Focusing on legitimate community needs through practical, organized programs supported by verified volunteers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {programs.slice(0, 6).map(program => (
            <Card key={program.id} hover className="overflow-hidden flex flex-col h-full bg-white border border-[#E5E0D5]">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#B06D50] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs border border-[#E5E0D5]">
                  {program.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#F1EDE4] flex items-center justify-center border border-[#E5E0D5]">
                    {getCategoryIcon(program.category)}
                  </div>
                  <span className="text-xs text-[#6D6A61] font-medium">{program.location}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#3D3B36] mb-2 leading-snug">
                  {program.title}
                </h3>
                <p className="text-sm text-[#6D6A61] leading-relaxed mb-6 flex-grow">
                  {program.description}
                </p>
                <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6E52] bg-[#F1EDE4] border border-[#E5E0D5] px-2.5 py-1 rounded-full">
                    {program.peopleHelped || 'Active Program'}
                  </span>
                  <Link
                    to={`/support?program=${program.id}`}
                    className="text-xs font-bold text-[#5E6E52] hover:text-[#3D3B36] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/programs">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E6E52] hover:text-[#3D3B36] transition-colors">
              View Detailed Program Profiles & Objectives <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
