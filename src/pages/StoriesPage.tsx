import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, UserCheck, Heart } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Story } from '../types';

export const StoriesPage: React.FC = () => {
  const stories = storage.getPublishedStories();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Community Narratives"
          badgeIcon={<BookOpen className="w-3.5 h-3.5" />}
          title="Human Stories of Dignity & Connection"
          description="True reflections of the individuals we visit and support across Uzbekistan. Published with informed consent and deep human respect."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {stories.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#64748B]">
              Consent-based community stories will be published here when available.
            </div>
          ) : stories.map(story => (
            <Card key={story.id} hover className="overflow-hidden flex flex-col h-full group">
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#0D47A1] text-white text-xs font-bold px-2.5 py-1 rounded">
                  {story.category}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Consent Verified</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-[#64748B] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {story.date}
                  </span>
                  <span>•</span>
                  <span>Author: {story.author}</span>
                </div>

                <h3 className="text-xl font-bold text-[#172033] mb-3 leading-snug group-hover:text-[#1565C0] transition-colors">
                  {story.title}
                </h3>

                <p className="text-sm text-[#64748B] leading-relaxed mb-6 flex-grow">
                  {story.summary}
                </p>

                <div className="pt-4 border-t border-[#E2E8F0] mt-auto">
                  <button
                    onClick={() => setActiveStory(story)}
                    className="text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] hover:underline cursor-pointer"
                  >
                    Read Full Story Article →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Dignified Storytelling Statement */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] max-w-2xl mx-auto text-center text-xs text-[#64748B] leading-relaxed">
          <Heart className="w-4 h-4 text-[#1565C0] mx-auto mb-2" />
          <strong className="text-[#172033] block mb-1">Our Ethical Storytelling Charter:</strong>
          SAFA firmly rejects sensationalized depictions of poverty or illness. We portray our neighbors with integrity, agency, and respect. No personal address or vulnerable data is disclosed.
        </div>

        {/* Modal view for full story */}
        {activeStory && (
          <Modal
            isOpen={!!activeStory}
            onClose={() => setActiveStory(null)}
            title={activeStory.title}
            maxWidth="xl"
          >
            <div className="text-left space-y-4">
              <img
                src={activeStory.coverImage}
                alt={activeStory.title}
                className="w-full h-64 object-cover rounded-xl border border-[#E2E8F0]"
              />
              <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-[#E2E8F0]">
                <span>Category: <strong className="text-[#172033]">{activeStory.category}</strong></span>
                <span>Date: <strong className="text-[#172033]">{activeStory.date}</strong></span>
              </div>
              <div className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                {activeStory.body}
              </div>
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span>Author: {activeStory.author}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Verified Consent On File
                </span>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
