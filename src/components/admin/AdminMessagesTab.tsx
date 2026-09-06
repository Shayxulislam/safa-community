import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { ContactMessage, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminMessagesTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [messages, setMessages] = useState<ContactMessage[]>(storage.getContactMessages());
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved' | 'archived'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const refreshList = () => {
    const updated = storage.getContactMessages();
    setMessages(updated);
    if (selectedMessage) {
      const refreshedSelected = updated.find(m => m.id === selectedMessage.id) || null;
      setSelectedMessage(refreshedSelected);
    }
    onRefresh();
  };

  const handleStatusChange = (id: string, status: ContactMessage['status']) => {
    storage.updateContactStatus(id, status, currentUser.name);
    showNotice(`Marked message as ${status.replace('_', ' ')}.`);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      storage.deleteContactMessage(id, currentUser.name);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      showNotice('Inquiry deleted.');
      refreshList();
    }
  };

  const filtered = messages.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
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
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Inquiries</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Inquiries & Contact Inbox
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Direct communications sent from the public website contact form. Review partnership requests, press inquiries, and community mutual aid messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800">
            {messages.filter(m => m.status === 'new').length} New Inquiries
          </span>
        </div>
      </div>

      {/* Main Two-Column Inbox View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9C988D] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages by name, email, subject..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36] focus:outline-[#5E6E52]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['all', 'new', 'in_progress', 'resolved', 'archived'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-[#5E6E52] text-white font-bold'
                      : 'bg-white text-[#6D6A61] border border-[#E5E0D5] hover:bg-[#F1EDE4]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(msg => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#F1EDE4] border-[#5E6E52] shadow-xs'
                      : msg.status === 'new'
                      ? 'bg-white border-amber-300 shadow-2xs font-semibold'
                      : 'bg-white border-[#E5E0D5] hover:border-[#5E6E52]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#3D3B36] truncate">
                      {msg.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      msg.status === 'new'
                        ? 'bg-amber-100 text-amber-800'
                        : msg.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : msg.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {msg.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-[#5E6E52] font-medium truncate mb-1">
                    {msg.subject}
                  </div>

                  <p className="text-xs text-[#6D6A61] line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="mt-2 text-[10px] text-[#9C988D] flex items-center justify-between">
                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                    <span>{msg.email}</span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0D5] text-[#6D6A61] text-xs">
                No messages found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Message Details */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <Card className="p-6 sm:p-8 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D5] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B06D50] tracking-wider">
                    Inquiry Details
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#3D3B36] mt-0.5">
                    {selectedMessage.subject}
                  </h3>
                  <div className="text-xs text-[#6D6A61] mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5E6E52]" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={e => handleStatusChange(selectedMessage.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Sender Details */}
              <div className="p-4 rounded-2xl bg-[#F1EDE4]/50 border border-[#E5E0D5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[#6D6A61]">From</span>
                  <span className="font-semibold text-[#3D3B36]">{selectedMessage.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[#6D6A61]">Email</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[#5E6E52] hover:underline font-mono flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-[#6D6A61]">Phone</span>
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="text-[#5E6E52] hover:underline font-mono flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-2">
                  Message Content
                </label>
                <div className="p-5 rounded-2xl bg-white border border-[#E5E0D5] text-xs leading-relaxed text-[#3D3B36] whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D5]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Inquiry</span>
                </Button>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5E6E52] text-white text-xs font-semibold hover:bg-[#4E5C43] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 bg-[#F1EDE4]/30 rounded-3xl border border-dashed border-[#E5E0D5] text-[#6D6A61] text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-[#9C988D]" />
              <p>Select an inquiry from the list on the left to read and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
