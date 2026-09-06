import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, ShieldCheck, CheckCircle2, Camera } from 'lucide-react';
import { storage } from '../../services/storage';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const PieceOfOurWorkSection: React.FC = () => {
  const publishedWork = storage.getPublishedWorkItems();

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5] mb-3 shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-[#5E6E52]" />
              <span>Living Archive</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight leading-tight">
              Piece of Our Work
            </h2>
            <p className="mt-3 text-base text-[#6D6A61] leading-relaxed">
              Explore completed visits, winter drives, ramp installations, and grassroots community actions verified by the SAFA field committee.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/work">
              <Button variant="outline" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                View All Completed Work ({publishedWork.length})
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedWork.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[#BFDBFE] p-8 text-center text-sm text-[#6D6A61]">
              Verified project documentation will be published here when available.
            </div>
          ) : publishedWork.slice(0, 3).map(item => (
            <Card key={item.id} hover className="overflow-hidden flex flex-col h-full group bg-white border border-[#E5E0D5]">
              {/* Cover image */}
              <div className="relative h-52 overflow-hidden bg-[#F1EDE4]">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#5E6E52] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  {item.category}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#5E6E52] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-[#E5E0D5]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-[#6D6A61] mb-2.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                    <span>{item.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#5E6E52] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#3D3B36] mb-2.5 leading-snug group-hover:text-[#5E6E52] transition-colors">
                  <Link to={`/work/${item.slug}`}>
                    {item.title}
                  </Link>
                </h3>

                <p className="text-sm text-[#6D6A61] leading-relaxed mb-4 flex-grow line-clamp-3">
                  {item.summary}
                </p>

                <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between text-xs mt-auto">
                  <span className="text-[#5E6E52] font-bold text-[10px] uppercase tracking-wider bg-[#F1EDE4] border border-[#E5E0D5] px-2.5 py-1 rounded-full">
                    {item.supportedCommunity}
                  </span>
                  <Link
                    to={`/work/${item.slug}`}
                    className="font-bold text-[#5E6E52] hover:text-[#3D3B36] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
