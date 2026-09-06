import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  ExternalLink,
  Tag,
  AlertCircle
} from 'lucide-react';
import { EventItem, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminEventsTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminEventsTab: React.FC<AdminEventsTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [events, setEvents] = useState<EventItem[]>(storage.getEvents());
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');

  const [formData, setFormData] = useState<EventItem>({
    id: '',
    slug: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 - 14:00',
    location: 'Tashkent, Uzbekistan',
    coverImage: '',
    category: 'Community Relief',
    registrationUrl: '/volunteer',
    registrationInfo: 'Advance volunteer registration requested.',
    status: 'upcoming'
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const refreshList = () => {
    setEvents(storage.getEvents());
    onRefresh();
  };

  const handleStartCreate = () => {
    setEditingEvent(null);
    setFormData({
      id: `evt-${Date.now()}`,
      slug: `event-${Date.now()}`,
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 - 14:00',
      location: 'Tashkent, Uzbekistan',
      coverImage: '',
      category: 'Community Relief',
      registrationUrl: '/volunteer',
      registrationInfo: 'Open to youth volunteers.',
      status: 'upcoming'
    });
    setIsCreating(true);
  };

  const handleStartEdit = (evt: EventItem) => {
    setIsCreating(false);
    setEditingEvent(evt);
    setFormData({ ...evt });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const toSave: EventItem = {
      ...formData,
      slug,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    storage.saveEvent(toSave, currentUser.name);
    showNotice(`Event "${toSave.title}" saved successfully.`);
    setIsCreating(false);
    setEditingEvent(null);
    refreshList();
  };

  const handleDelete = (evt: EventItem) => {
    if (window.confirm(`Delete event "${evt.title}"? This cannot be undone.`)) {
      storage.deleteEvent(evt.id, currentUser.name);
      showNotice(`Event "${evt.title}" deleted.`);
      refreshList();
    }
  };

  const filteredEvents = events.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-4 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Community Engagements</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Events & Community Drives
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Schedule and publish upcoming food distribution drives, volunteer training sessions, elder companion days, and ramp handover celebrations.
          </p>
        </div>

        <Button
          onClick={handleStartCreate}
          variant="primary"
          size="md"
          className="shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Button>
      </div>

      {/* Form / Editor Modal */}
      {(isCreating || editingEvent) && (
        <Card className="p-6 sm:p-8 bg-[#FDFCF9] border-2 border-[#5E6E52] rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Create New Community Event'}
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Fill out the event schedule and instructions for volunteers.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingEvent(null);
              }}
              className="p-1.5 rounded-full text-[#6D6A61] hover:bg-[#F1EDE4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: prev.slug.startsWith('event-') || !prev.slug ? autoSlug : prev.slug
                    }));
                  }}
                  placeholder="e.g. Navruz 2026 Grocery Distribution"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  URL Slug (/events/:slug)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="navruz-2026-grocery-distribution"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time || ''}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  placeholder="10:00 - 15:00"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Category
                </label>
                <select
                  value={formData.category || 'Community Relief'}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                >
                  <option value="Community Relief">Community Relief</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Field Action">Field Action</option>
                  <option value="Accessibility Ramps">Accessibility Ramps</option>
                  <option value="Volunteer Workshop">Volunteer Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Chilanzar Mahalla Center, Tashkent"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Full Event Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details on what volunteers will do, who we are helping, and what to bring..."
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs leading-relaxed text-[#3D3B36]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Registration URL or CTA Link
                </label>
                <input
                  type="text"
                  value={formData.registrationUrl || ''}
                  onChange={e => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="/volunteer or external link"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Registration Note / Requirements
                </label>
                <input
                  type="text"
                  value={formData.registrationInfo || ''}
                  onChange={e => setFormData({ ...formData, registrationInfo: e.target.value })}
                  placeholder="e.g. Open to all youth 18+. Training provided."
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingEvent ? 'Save Event Changes' : 'Publish Event'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-2 text-xs font-bold">
        {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-[#5E6E52] text-white'
                : 'text-[#6D6A61] hover:bg-[#F1EDE4]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map(evt => (
          <Card
            key={evt.id}
            className="p-5 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    evt.status === 'upcoming'
                      ? 'bg-emerald-100 text-emerald-800'
                      : evt.status === 'completed'
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {evt.status}
                  </span>
                  {evt.category && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1EDE4] text-[#6D6A61]">
                      {evt.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(evt)}
                    className="p-1.5 rounded-lg text-[#6D6A61] hover:bg-[#F1EDE4]"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-base text-[#3D3B36]">
                  {evt.title}
                </h4>
                <p className="text-xs text-[#6D6A61] mt-1 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#6D6A61] pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                  <span>{evt.date} {evt.time && `• ${evt.time}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B06D50]" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between text-xs">
              <a
                href={`/events/${evt.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5E6E52] hover:underline flex items-center gap-1 font-semibold"
              >
                View on Public Site <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] font-mono text-[#9C988D]">slug: {evt.slug}</span>
            </div>
          </Card>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full p-8 text-center bg-[#F1EDE4]/30 rounded-3xl border border-[#E5E0D5] text-[#6D6A61] text-xs">
            No events found in this category. Click "Create New Event" to publish one.
          </div>
        )}
      </div>
    </div>
  );
};
