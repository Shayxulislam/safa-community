import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Newspaper, Calendar, MapPin, Tag, User, ArrowRight, Video, Image, Search, Filter, ShieldCheck, ChevronRight } from 'lucide-react';
import { storage } from '../services/storage';
import { Article } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const publishedArticles = storage.getPublishedArticles();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ['all', ...Array.from(new Set(publishedArticles.map(a => a.category)))];

  const filteredArticles = publishedArticles.filter(a => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesQuery = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="py-12 sm:py-20 bg-[#FDFCF9] min-h-screen text-[#3D3B36] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-4">
            <Newspaper className="w-4 h-4" />
            <span>SAFA News & Field Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#3D3B36] tracking-tight">
            Articles & Updates
          </h1>
          <p className="text-base sm:text-lg text-[#6D6A61] mt-2 max-w-2xl">
            Verified field reports, community initiatives, and direct insights authored by the SAFA team and youth coordinators.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-[#F1EDE4] border border-[#E5E0D5]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#5E6E52] text-white shadow-xs'
                    : 'bg-white text-[#6D6A61] hover:text-[#3D3B36] border border-[#E5E0D5]'
                }`}
              >
                {cat === 'all' ? 'All Updates' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#6D6A61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E5E0D5] bg-white text-xs text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>
        </div>

        {/* Article Grid */}
        {filteredArticles.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D5] my-8">
            <p className="text-base text-[#6D6A61]">No published articles found matching your criteria.</p>
            {publishedArticles.length === 0 && (
              <p className="text-xs text-[#6D6A61] mt-2">
                Administrators can log into the CMS at <Link to="/admin/login" className="text-[#5E6E52] underline font-semibold">/admin</Link> to create and publish articles.
              </p>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <Card
                key={article.id}
                className="flex flex-col overflow-hidden bg-white border border-[#E5E0D5] rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 group"
              >
                <div className="relative h-52 overflow-hidden bg-[#F1EDE4]">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider">
                    {article.category}
                  </div>
                  {article.videoUrl && (
                    <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-full bg-[#B06D50] text-white text-[11px] font-semibold flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-[#6D6A61] mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                        {new Date(article.date).toLocaleDateString()}
                      </span>
                      {article.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#5E6E52]" />
                          {article.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#3D3B36] group-hover:text-[#5E6E52] transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#6D6A61] line-clamp-3 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {article.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1EDE4] text-[#6D6A61]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#6D6A61]">
                      <div className="w-6 h-6 rounded-full bg-[#5E6E52]/15 text-[#5E6E52] flex items-center justify-center font-bold text-[10px]">
                        {article.author.charAt(0)}
                      </div>
                      <span className="font-medium">{article.author}</span>
                    </div>

                    <button
                      onClick={() => setActiveArticle(article)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#5E6E52] hover:text-[#3D3B36] transition-colors"
                    >
                      Read Full Article <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FDFCF9] border border-[#E5E0D5] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F1EDE4] hover:bg-[#E5E0D5] flex items-center justify-center text-[#3D3B36] font-bold"
            >
              ✕
            </button>

            <div className="inline-block px-3 py-1 rounded-full bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-3">
              {activeArticle.category}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D3B36] leading-tight mb-4">
              {activeArticle.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6D6A61] mb-6 pb-4 border-b border-[#E5E0D5]">
              <span className="flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-[#5E6E52]" />
                {activeArticle.author} ({activeArticle.authorRole || 'Contributor'})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                {new Date(activeArticle.date).toLocaleDateString()}
              </span>
              {activeArticle.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5E6E52]" />
                  {activeArticle.location}
                </span>
              )}
            </div>

            <div className="mb-6 rounded-2xl overflow-hidden h-72 sm:h-96 bg-[#F1EDE4]">
              <img
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="prose prose-stone max-w-none text-sm leading-relaxed text-[#3D3B36] space-y-4 mb-8 whitespace-pre-line">
              {activeArticle.content}
            </div>

            {/* Video embed if present */}
            {activeArticle.videoUrl && (
              <div className="mb-8 p-4 rounded-2xl bg-[#F1EDE4] border border-[#E5E0D5]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-3 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#B06D50]" />
                  Associated Field Video
                </h4>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={
                      activeArticle.videoUrl.includes('watch?v=')
                        ? activeArticle.videoUrl.replace('watch?v=', 'embed/')
                        : activeArticle.videoUrl
                    }
                    title={activeArticle.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Gallery if present */}
            {activeArticle.galleryImages && activeArticle.galleryImages.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-3 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-[#5E6E52]" />
                  Field Photo Archive
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeArticle.galleryImages.map((img, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-[#F1EDE4]">
                      <img
                        src={img}
                        alt="Archive photo"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {activeArticle.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F1EDE4] text-[#6D6A61]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => setActiveArticle(null)}>
                Close Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
