import React, { useState } from 'react';
import {
  Users2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Search
} from 'lucide-react';
import { VolunteerApplication, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminVolunteersTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminVolunteersTab: React.FC<AdminVolunteersTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const volunteers = storage.getVolunteers();
  const [filter, setFilter] = useState<string>('all');
  const [selectedVol, setSelectedVol] = useState<VolunteerApplication | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleStatusChange = (id: string, status: VolunteerApplication['status']) => {
    storage.updateVolunteerStatus(id, status, currentUser.name);
    onRefresh();
    showNotice(`Application marked as "${status}".`);
  };

  const filtered = volunteers.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Users2 className="w-4 h-4" />
            <span>Youth & Volunteer Network</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Volunteer Applications & Onboarding
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Review submissions from youth and community members wishing to volunteer in distribution drives and home visits.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'new', 'reviewed', 'accepted', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider transition-all ${
              filter === status
                ? 'bg-[#5E6E52] text-white shadow-xs'
                : 'bg-white text-[#6D6A61] hover:text-[#3D3B36] border border-[#E5E0D5]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-[#6D6A61] py-8 text-center">No volunteer applications in this filter.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(vol => (
              <div
                key={vol.id}
                className="p-4 rounded-2xl border border-[#E5E0D5] bg-[#FDFCF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#3D3B36]">{vol.fullName}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      vol.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : vol.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : vol.status === 'reviewed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {vol.status}
                    </span>
                    <span className="text-[11px] text-[#6D6A61]">
                      • Applied {new Date(vol.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6D6A61]">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#5E6E52]" /> {vol.email}
                    </span>
                    {vol.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#5E6E52]" /> {vol.phone}
                      </span>
                    )}
                    {vol.city && <span>• City: {vol.city}</span>}
                  </div>

                  {vol.interests && vol.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {vol.interests.map(i => (
                        <span key={i} className="text-[10px] px-2 py-0.2 rounded bg-[#F1EDE4] text-[#6D6A61]">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}

                  {vol.message && (
                    <p className="text-xs text-[#3D3B36] italic pt-1 max-w-xl">
                      "{vol.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {vol.status !== 'accepted' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(vol.id, 'accepted')}
                    >
                      Accept
                    </Button>
                  )}
                  {vol.status !== 'reviewed' && vol.status !== 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(vol.id, 'reviewed')}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                  {vol.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(vol.id, 'rejected')}
                      className="text-xs text-[#6D6A61] hover:text-red-700 p-1"
                    >
                      Decline
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
