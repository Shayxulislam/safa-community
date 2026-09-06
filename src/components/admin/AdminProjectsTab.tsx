import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Video,
  ShieldCheck
} from 'lucide-react';
import { WorkItem, User, ContentWorkflowStatus } from '../../types';
import { storage } from '../../services/storage';
import { auth } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AdminProjectsTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const workItems = storage.getWorkItems();

  const isSuperAdmin = currentUser.role === 'super_admin';
  const canPublish = auth.hasPermission('work.publish', currentUser);
  const canApprove = auth.hasPermission('work.publish', currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkItem['category']>('Home Visits');
  const [location, setLocation] = useState('Tashkent, Uzbekistan');
  const [supportedCommunity, setSupportedCommunity] = useState('Elderly citizens living alone');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [contributionAmount, setContributionAmount] = useState<number>(1500000);
  const [resourcesUsed, setResourcesUsed] = useState('Warm blankets, electric heaters, 2-month food reserves');
  const [impactSummary, setImpactSummary] = useState('Directly warmed and supported 18 households');
  const [workflowStatus, setWorkflowStatus] = useState<ContentWorkflowStatus>('published');
  const [verificationStatus, setVerificationStatus] = useState<WorkItem['verificationStatus']>('verified');

  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Home Visits');
    setLocation('Tashkent, Uzbekistan');
    setSupportedCommunity('Elderly residents');
    setSummary('');
    setDescription('');
    setCoverImage('');
    setVideoUrl('');
    setContributionAmount(1500000);
    setResourcesUsed('Food packages, hygiene items');
    setImpactSummary('Direct assistance to families');
    setWorkflowStatus(canPublish ? 'published' : 'submitted');
    setVerificationStatus('verified');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WorkItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location);
    setSupportedCommunity(item.supportedCommunity);
    setSummary(item.summary);
    setDescription(item.description);
    setCoverImage(item.coverImage);
    setVideoUrl(item.videoUrl || '');
    setContributionAmount(item.contributionAmount || 0);
    setResourcesUsed(item.resourcesUsed || '');
    setImpactSummary(item.impactSummary || '');
    setWorkflowStatus(item.workflowStatus || (item.status as any) || 'published');
    setVerificationStatus(item.verificationStatus);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const now = new Date().toISOString();

    const item: WorkItem = {
      id: editingItem ? editingItem.id : `work-${Date.now()}`,
      slug: editingItem ? editingItem.slug : `${slug}-${Date.now().toString(36).substring(0, 4)}`,
      title: title.trim(),
      category,
      location,
      supportedCommunity,
      summary: summary.trim(),
      description: description.trim(),
      coverImage,
      videoUrl: videoUrl.trim() || undefined,
      contributionAmount,
      currency: 'UZS',
      resourcesUsed,
      impactSummary,
      eventDate: editingItem?.eventDate || now.split('T')[0],
      publishedAt: editingItem?.publishedAt || now,
      status: workflowStatus === 'published' ? 'published' : 'draft',
      workflowStatus,
      verificationStatus,
      verifiedBy: verificationStatus === 'verified' ? currentUser.name : undefined,
      gallery: editingItem?.gallery || []
    };

    storage.saveWorkItem(item, currentUser.name);
    setIsModalOpen(false);
    onRefresh();
    showNotice(`Field project "${item.title}" saved successfully!`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this field project?')) {
      storage.deleteWorkItem(id, currentUser.name);
      onRefresh();
      showNotice('Project removed from CMS.');
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
            <FolderHeart className="w-4 h-4" />
            <span>Field Work & Transparency Archive</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Piece of Our Work Projects
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Record tangible field projects, home visits, and emergency relief drives. All items feature budget transparency and verification seals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openNewModal}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          + Add Field Project
        </Button>
      </div>

      {/* Projects List */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="space-y-4">
          {workItems.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-[#E5E0D5] bg-[#FDFCF9] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F1EDE4] shrink-0 border border-[#E5E0D5]">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1EDE4] text-[#6D6A61]">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.workflowStatus === 'published' || item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.workflowStatus || item.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {item.verificationStatus}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#3D3B36]">
                    {item.title}
                  </h4>

                  <p className="text-[#6D6A61] text-[11px] line-clamp-1 max-w-lg">
                    {item.summary}
                  </p>

                  <div className="text-[11px] text-[#6D6A61] flex items-center gap-3 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5E6E52]" /> {item.location}
                    </span>
                    <span>• {item.supportedCommunity}</span>
                    {item.contributionAmount && (
                      <span className="font-bold text-[#3D3B36]">
                        • Budget: {item.contributionAmount.toLocaleString()} {item.currency || 'UZS'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(item)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Project
                </Button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-[#6D6A61] hover:text-red-700 hover:bg-red-50"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Field Project' : 'Create Field Project'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-left text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Winter Warmth Drive 2026: 200 Heaters Delivered"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="Home Visits">Home Visits</option>
                <option value="Food & Medical Aid">Food & Medical Aid</option>
                <option value="Winter Heating Drive">Winter Heating Drive</option>
                <option value="Youth Mentorship">Youth Mentorship</option>
                <option value="Disability Accessibility">Disability Accessibility</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Supported Community / Beneficiaries
            </label>
            <input
              type="text"
              value={supportedCommunity}
              onChange={e => setSupportedCommunity(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Brief Summary
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Full Project Description & Field Notes
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Cover Photo URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Field Video URL (YouTube)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Budget Allocated (UZS)
              </label>
              <input
                type="number"
                value={contributionAmount}
                onChange={e => setContributionAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Workflow Status
              </label>
              <select
                value={workflowStatus}
                onChange={e => setWorkflowStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted for Review</option>
                <option value="published">Published Live</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="verified">Verified (Sealed)</option>
                <option value="pending">Pending Audit</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
