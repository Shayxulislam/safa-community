import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, ShieldCheck, ArrowRight, Camera, Filter } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const PieceOfWorkPage: React.FC = () => {
  const publishedWork = storage.getPublishedWorkItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(publishedWork.map(w => w.category)))];

  const filtered = publishedWork.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Completed Work Archive"
          badgeIcon={<Camera className="w-3.5 h-3.5" />}
          title="Piece of Our Work"
          description="A living visual documentation of completed home visits, winter distribution drives, accessibility ramps, and direct relief projects verified by SAFA."
        />

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#172033] focus:border-[#1565C0] focus:bg-white outline-hidden"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0D47A1] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-left text-xs text-[#64748B] mb-6 font-medium">
          Showing {filtered.length} of {publishedWork.length} verified projects
        </div>

        {/* Grid of Work Items */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0] p-8">
            <p className="text-base font-semibold text-[#172033] mb-2">No matching projects found</p>
            <p className="text-xs text-[#64748B]">Try adjusting your search criteria or filter tags.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(item => (
              <Card key={item.id} hover className="overflow-hidden flex flex-col h-full group">
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-[#0D47A1] text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Action</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow text-left">
                  <div className="flex items-center gap-4 text-xs text-[#64748B] mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#172033] mb-2.5 leading-snug group-hover:text-[#1565C0] transition-colors">
                    <Link to={`/work/${item.slug}`}>
                      {item.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-[#64748B] leading-relaxed mb-4 flex-grow line-clamp-3">
                    {item.summary}
                  </p>

                  <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs mt-auto">
                    <span className="text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded">
                      {item.supportedCommunity}
                    </span>
                    <Link
                      to={`/work/${item.slug}`}
                      className="font-bold text-[#1565C0] hover:text-[#0D47A1] inline-flex items-center gap-1"
                    >
                      <span>Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
