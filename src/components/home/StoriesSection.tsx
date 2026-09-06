import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, UserCheck, Calendar } from 'lucide-react';
import { storage } from '../../services/storage';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

export const StoriesSection: React.FC = () => {
  const stories = storage.getPublishedStories();

  return (
    <section className="py-16 sm:py-24 bg-[#C1E8FF]/35 border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Human Impact Stories"
          badgeIcon={<BookOpen className="w-3.5 h-3.5" />}
          title="Stories of Dignity, Connection & Hope"
          description="Respectful narratives documenting how community compassion makes a lasting difference in individual lives, published with verified consent."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {stories.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#6D6A61]">
              Consent-based community stories will be published here when available.
            </div>
          ) : stories.slice(0, 2).map(story => (
            <Card key={story.id} hover className="overflow-hidden flex flex-col md:flex-row h-full group bg-white border border-[#E5E0D5] rounded-[2rem]">
              <div className="md:w-5/12 h-60 md:h-auto overflow-hidden relative shrink-0">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#5E6E52] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  {story.category}
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-between flex-grow text-left">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#6D6A61] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                      {story.date}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[#5E6E52] bg-[#F1EDE4] border border-[#E5E0D5] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <UserCheck className="w-3 h-3" />
                      Consent Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#3D3B36] mb-3 group-hover:text-[#5E6E52] transition-colors leading-snug">
                    <Link to="/stories">{story.title}</Link>
                  </h3>
                  <p className="text-sm text-[#6D6A61] leading-relaxed mb-4">
                    {story.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between text-xs">
                  <span className="text-[#6D6A61] italic font-serif">By {story.author}</span>
                  <Link
                    to="/stories"
                    className="font-bold text-[#5E6E52] hover:text-[#3D3B36] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E6E52] hover:text-[#3D3B36] transition-colors"
          >
            Explore All Community Stories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
