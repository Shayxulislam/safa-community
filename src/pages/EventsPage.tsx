import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const EventsPage: React.FC = () => {
  const events = storage.getEvents();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filtered = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return e.status === 'upcoming' || e.status === 'ongoing';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  return (
    <div className="py-12 sm:py-16 bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Community Engagement"
          badgeIcon={<Calendar className="w-3.5 h-3.5" />}
          title="Events & Community Drives"
          description="Participate in hands-on relief, youth volunteer workshops, and community infrastructure initiatives across Tashkent and regional Uzbekistan."
        />

        {/* Filter controls */}
        <div className="flex items-center gap-2 mb-8 border-b border-[#E5E0D5] pb-3 text-xs font-bold">
          {(['all', 'upcoming', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl capitalize transition-colors ${
                filter === tab
                  ? 'bg-[#5E6E52] text-white'
                  : 'bg-white text-[#6D6A61] border border-[#E5E0D5] hover:bg-[#F1EDE4]'
              }`}
            >
              {tab === 'all' ? 'All Gatherings' : `${tab} Events`}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(evt => (
            <Card
              key={evt.id}
              className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#F1EDE4] border border-[#E5E0D5]">
                  {evt.coverImage ? (
                    <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6 text-center text-xs text-[#6D6A61]">Authentic event photography will be published here.</div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    evt.status === 'upcoming'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evt.status === 'completed'
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {evt.status}
                  </span>
                  {evt.category && (
                    <span className="text-[10px] font-semibold text-[#6D6A61] bg-[#F1EDE4] px-2 py-0.5 rounded-full">
                      {evt.category}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-[#3D3B36] leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#6D6A61] leading-relaxed line-clamp-3">
                  {evt.description}
                </p>

                <div className="space-y-1.5 text-xs text-[#6D6A61] pt-2 border-t border-[#E5E0D5]/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                    <span>{evt.date} {evt.time && `• ${evt.time}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B06D50]" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between">
                {evt.registrationUrl ? (
                  <a
                    href={evt.registrationUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E6E52] hover:underline"
                  >
                    <span>Register / Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to="/volunteer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E6E52] hover:underline"
                  >
                    <span>Volunteer with Us</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {evt.registrationInfo && (
                  <span className="text-[10px] text-[#9C988D] truncate max-w-[140px]">
                    {evt.registrationInfo}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-[#F1EDE4] border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h4 className="font-serif font-bold text-xl text-[#3D3B36]">
              Want to organize an initiative in your mahalla?
            </h4>
            <p className="text-xs text-[#6D6A61] mt-1 max-w-lg">
              SAFA partners directly with local youth groups and community elders. Propose an accessibility project or grocery drive.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#5E6E52] text-white text-xs font-bold hover:bg-[#4E5C43] transition-colors shrink-0"
          >
            Contact Coordination Team
          </Link>
        </div>
      </div>
    </div>
  );
};
