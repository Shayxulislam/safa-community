import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProgramsPage: React.FC = () => {
  const allPrograms = storage.getPrograms();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(allPrograms.map(p => p.category)))];

  const filtered = selectedCategory === 'all'
    ? allPrograms
    : allPrograms.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Action Programs"
          title="Direct Community Support Programs"
          description="Structured initiatives turning contributions into tangible help, coordinated by volunteer teams across Uzbekistan."
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#cbd5e1] hover:text-[#172033]'
              }`}
            >
              {cat === 'all' ? 'All Initiatives' : cat}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#64748B]">
              Verified programs will be published here when available.
            </div>
          ) : filtered.map(program => (
            <Card key={program.id} hover className="overflow-hidden flex flex-col h-full">
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#0D47A1] text-white text-xs font-bold px-2.5 py-1 rounded">
                  {program.category}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow text-left">
                <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>{program.location}</span>
                </div>

                <h3 className="text-xl font-bold text-[#172033] mb-2 leading-snug">
                  {program.title}
                </h3>

                <p className="text-sm text-[#64748B] leading-relaxed mb-4 flex-grow">
                  {program.longDescription || program.description}
                </p>

                {program.peopleHelped && (
                  <div className="mb-6 p-2.5 rounded-lg bg-[#EAF4FF] text-[#0D47A1] text-xs font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1565C0]" />
                    <span>Verified Reach: {program.peopleHelped}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] mt-auto">
                  <Link to={`/support?program=${program.id}`} className="w-full block">
                    <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                      {program.ctaText || 'Support This Initiative'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
