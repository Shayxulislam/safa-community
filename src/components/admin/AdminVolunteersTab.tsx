import React, { useEffect, useState } from 'react';
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
  currentUser: _currentUser,
  onRefresh
}) => {
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVol, setSelectedVol] = useState<VolunteerApplication | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), pageSize: '25', status: filter, q: search });
    setLoading(true);
    setError('');
    fetch(`/api/v1/admin/volunteers?${params}`, { credentials: 'same-origin' })
      .then(async response => {
        const result = await response.json().catch(() => ({})) as { items?: VolunteerApplication[]; total?: number; error?: string };
        if (!response.ok) throw new Error(result.error || 'Could not load volunteer applications.');
        if (active) {
          setVolunteers(result.items || []);
          setTotal(result.total || 0);
        }
      })
      .catch(loadError => { if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load volunteer applications.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, page, search]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleStatusChange = async (id: string, status: VolunteerApplication['status']) => {
    setError('');
    try {
      const response = await fetch(`/api/v1/admin/volunteers/${encodeURIComponent(id)}`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Could not update volunteer status.');
      setVolunteers(items => items.map(item => item.id === id ? { ...item, status } : item));
      onRefresh();
      showNotice(`Application marked as "${status}".`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update volunteer status.');
    }
  };

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
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#9C988D] absolute left-3.5 top-3" />
        <input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email or phone" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-white text-sm" />
      </div>
      <div className="flex items-center gap-2 text-xs">
        {['all', 'new', 'reviewed', 'contacted', 'accepted', 'rejected', 'archived'].map(status => (
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
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {loading ? <p role="status" className="py-8 text-center text-sm text-[#6D6A61]">Loading applications…</p> : volunteers.length === 0 ? (
          <p className="text-xs text-[#6D6A61] py-8 text-center">No volunteer applications in this filter.</p>
        ) : (
          <div className="space-y-3">
            {volunteers.map(vol => (
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
        {!loading && total > 25 && <div className="flex items-center justify-between border-t border-[#E5E0D5] pt-4 text-sm">
          <span className="text-[#6D6A61]">{total} applications</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(value => value + 1)}>Next</Button></div>
        </div>}
      </Card>
    </div>
  );
};
