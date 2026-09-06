import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  FileText,
  Heart,
  Users,
  CheckCircle2,
  Share2,
  ExternalLink
} from 'lucide-react';
import { storage } from '../services/storage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const WorkDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const item = slug ? storage.getWorkItemBySlug(slug) : undefined;
  const allWork = storage.getPublishedWorkItems();
  const related = allWork.filter(w => w.id !== item?.id).slice(0, 2);

  if (!item) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#172033] mb-4">Project Not Found</h2>
        <p className="text-sm text-[#64748B] mb-6">
          The requested work record may have been updated, archived, or is awaiting publication verification.
        </p>
        <Link to="/work">
          <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Piece of Our Work
          </Button>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Project link copied to clipboard!');
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Navigation back */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D47A1] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Work</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Project</span>
          </button>
        </div>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0D47A1] text-white">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#bbf7d0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Field Verified & Published</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight leading-tight mb-4">
          {item.title}
        </h1>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#64748B] pb-6 mb-8 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1565C0]" />
            <span>Date: <strong>{item.eventDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#1565C0]" />
            <span>Location: <strong>{item.location}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#1565C0]" />
            <span>Supported: <strong>{item.supportedCommunity}</strong></span>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] mb-10">
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* Narrative & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold text-[#172033] mb-4">
              Project Overview & Field Execution
            </h2>
            <div className="prose text-[#475569] text-base leading-relaxed space-y-4 mb-8">
              <p className="font-medium text-[#172033]">{item.summary}</p>
              <p>{item.description}</p>
            </div>

            {/* Gallery Media */}
            {item.gallery && item.gallery.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-bold text-[#172033] mb-4">
                  Field Photography & Action Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.gallery.map(media => (
                    <div key={media.id} className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-white">
                      <img
                        src={media.fileUrl}
                        alt={media.altText}
                        className="w-full h-52 object-cover"
                      />
                      {media.caption && (
                        <p className="p-3 text-xs text-[#64748B] bg-[#F8FAFC] border-t border-[#E2E8F0]">
                          {media.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Verification Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-4">
                Verification Ledger
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[#64748B] block mb-0.5">Verification Committee:</span>
                  <span className="font-semibold text-[#172033]">{item.verifiedBy || 'SAFA Board & Field Supervisors'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block mb-0.5">Verified At:</span>
                  <span className="font-semibold text-[#172033]">{item.verifiedAt || item.publishedAt}</span>
                </div>
                {item.contributionAmount && (
                  <div>
                    <span className="text-[#64748B] block mb-0.5">Disbursed Budget:</span>
                    <span className="font-semibold text-[#0D47A1] text-sm">
                      {item.contributionAmount.toLocaleString()} {item.currency || 'UZS'}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Beneficiary Privacy Protected</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Addresses, phone numbers, and identity cards are strictly protected and never published.
                  </p>
                </div>
              </div>
            </Card>

            {/* Support Callout */}
            <Card className="p-6 bg-gradient-to-br from-[#EAF4FF] to-white border-[#cbe4ff]">
              <h3 className="text-base font-bold text-[#0D47A1] mb-2">
                Inspire the Next Action
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                Help SAFA launch the next initiative for elderly care, barrier-free access, or family relief.
              </p>
              <Link to="/support" className="block w-full">
                <Button variant="primary" size="md" className="w-full" icon={<Heart className="w-4 h-4 fill-white" />}>
                  Support Similar Work
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="pt-10 border-t border-[#E2E8F0]">
            <h3 className="text-xl font-bold text-[#172033] mb-6">
              More Verified Work by SAFA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map(rel => (
                <Card key={rel.id} hover className="p-4 flex gap-4 items-center">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-24 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-[#0D47A1]">{rel.category}</span>
                    <h4 className="text-sm font-bold text-[#172033] leading-snug line-clamp-1 hover:text-[#1565C0]">
                      <Link to={`/work/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-1 mt-1">{rel.summary}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
