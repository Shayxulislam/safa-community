import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Send,
  ExternalLink,
  MessageSquare,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { Article, User, ContentWorkflowStatus } from '../../types';
import { storage } from '../../services/storage';
import { auth, ROLE_DETAILS } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AdminArticlesTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminArticlesTab: React.FC<AdminArticlesTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const articles = storage.getArticles();

  const isSuperAdmin = currentUser.role === 'super_admin';
  const canPublishDirectly = auth.hasPermission('content.publish', currentUser);
  const canApprove = auth.hasPermission('content.review', currentUser);
  const canCreate = auth.hasPermission('content.create', currentUser);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReviewNotesModalOpen, setIsReviewNotesModalOpen] = useState(false);
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [pendingActionArticleId, setPendingActionArticleId] = useState<string | null>(null);

  // Form states for creating / editing
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Field Updates');
  const [location, setLocation] = useState('Tashkent, Uzbekistan');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Community, Youth, Field Report');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const openNewArticleModal = () => {
    setEditingArticleId(null);
    setTitle('');
    setCategory('Field Updates');
    setLocation('Tashkent, Uzbekistan');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setVideoUrl('');
    setTagsInput('Community, Youth, Field Report');
    setIsEditorOpen(true);
  };

  const openEditArticleModal = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setLocation(art.location || '');
    setExcerpt(art.excerpt);
    setContent(art.content);
    setCoverImage(art.coverImage);
    setVideoUrl(art.videoUrl || '');
    setTagsInput(art.tags.join(', '));
    setIsEditorOpen(true);
  };

  const handleSaveArticle = (targetStatus: ContentWorkflowStatus) => {
    if (!title.trim()) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    const existing = editingArticleId ? storage.getArticles().find(a => a.id === editingArticleId) : null;

    const newArt: Article = {
      id: editingArticleId || `art-${Date.now()}`,
      slug: existing?.slug || `${slug}-${Date.now().toString(36).substring(0, 4)}`,
      title: title.trim(),
      category,
      location,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage,
      galleryImages: existing?.galleryImages || [],
      videoUrl: videoUrl.trim() || undefined,
      tags,
      author: existing?.author || currentUser.name,
      authorRole: existing?.authorRole || ROLE_DETAILS[currentUser.role]?.title || 'Staff',
      authorId: existing?.authorId || currentUser.id,
      date: existing?.date || now.split('T')[0],
      status: targetStatus,
      publishedAt: targetStatus === 'published' ? (existing?.publishedAt || now) : existing?.publishedAt,
      reviewNotes: existing?.reviewNotes,
      reviewedBy: targetStatus === 'published' ? currentUser.name : existing?.reviewedBy
    };

    storage.saveArticle(newArt, currentUser.name);
    setIsEditorOpen(false);
    onRefresh();

    if (targetStatus === 'published') {
      showNotice(`Article "${newArt.title}" published live to the public website!`);
    } else if (targetStatus === 'submitted') {
      showNotice(`Article submitted for Lead Editorial Review.`);
    } else {
      showNotice(`Draft saved in CMS.`);
    }
  };

  // Workflow status transition handler
  const handleQuickStatusChange = (
    id: string,
    status: ContentWorkflowStatus,
    notes?: string
  ) => {
    storage.updateArticleStatus(id, status, notes, currentUser.name);
    onRefresh();
    showNotice(`Article status updated to "${status.replace('_', ' ')}"`);
  };

  // Reject modal handler
  const handleOpenRejectModal = (id: string) => {
    setPendingActionArticleId(id);
    setReviewNotesInput('');
    setIsReviewNotesModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (pendingActionArticleId) {
      handleQuickStatusChange(
        pendingActionArticleId,
        'rejected',
        reviewNotesInput.trim() || 'Please revise according to editorial guidelines.'
      );
      setIsReviewNotesModalOpen(false);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this article?')) {
      storage.deleteArticle(id, currentUser.name);
      onRefresh();
      showNotice('Article removed.');
    }
  };

  const filteredArticles = articles.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const getStatusBadge = (status: ContentWorkflowStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Live on Site</span>
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            <span>Needs Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" />
            <span>Revisions Needed</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            <FileCheck className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
            <span>Draft</span>
          </span>
        );
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

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4" />
            <span>SAFA News & Stories CMS</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Articles & News Management
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Create field reports, media dispatches, and press updates. Content flows through the "Draft → Review → Publish" verification workflow.
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            size="md"
            onClick={openNewArticleModal}
            icon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            + Create Article
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Articles' },
          { id: 'draft', label: 'Drafts' },
          { id: 'submitted', label: 'Pending Review' },
          { id: 'published', label: 'Published Live' },
          { id: 'rejected', label: 'Needs Revision' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-[#5E6E52] text-white shadow-xs'
                : 'bg-white text-[#6D6A61] hover:text-[#3D3B36] border border-[#E5E0D5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-[#6D6A61]">No articles found in this filter.</p>
            {canCreate && (
              <Button size="sm" variant="primary" onClick={openNewArticleModal}>
                Create Your First Article
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="p-4 rounded-2xl border border-[#E5E0D5] bg-[#FDFCF9] hover:border-[#5E6E52]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F1EDE4] shrink-0 border border-[#E5E0D5]">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1EDE4] text-[#6D6A61]">
                        {article.category}
                      </span>
                      {getStatusBadge(article.status)}
                      {article.videoUrl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B06D50]/10 text-[#B06D50] font-semibold flex items-center gap-1">
                          <Video className="w-3 h-3" /> Video
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#3D3B36] line-clamp-1">
                      {article.title}
                    </h4>

                    <p className="text-[#6D6A61] text-[11px] line-clamp-1 max-w-lg">
                      {article.excerpt}
                    </p>

                    <div className="text-[11px] text-[#6D6A61] flex items-center gap-3 pt-0.5">
                      <span>By: {article.author} ({article.authorRole})</span>
                      <span>• {new Date(article.date).toLocaleDateString()}</span>
                      {article.reviewedBy && (
                        <span className="text-[#5E6E52] font-medium">• Reviewed by {article.reviewedBy}</span>
                      )}
                    </div>

                    {/* Review notes if any */}
                    {article.reviewNotes && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 mt-1">
                        <strong>Editorial Note:</strong> {article.reviewNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E0D5]">
                  {/* Preview Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedArticle(article);
                      setIsPreviewOpen(true);
                    }}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>

                  {/* Edit button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditArticleModal(article)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>

                  {/* Workflow transition buttons for Editors / Super Admins */}
                  {(canApprove || canPublishDirectly) && article.status !== 'published' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleQuickStatusChange(article.id, 'published')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Publish Live
                    </Button>
                  )}

                  {/* Editorial Reject button */}
                  {canApprove && article.status === 'submitted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenRejectModal(article.id)}
                      className="text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Send Notes
                    </Button>
                  )}

                  {/* Content Manager: Submit for review if in draft or rejected */}
                  {!canPublishDirectly && (article.status === 'draft' || article.status === 'rejected') && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleQuickStatusChange(article.id, 'submitted')}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Submit for Review
                    </Button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="p-2 rounded-lg text-[#6D6A61] hover:text-red-700 hover:bg-red-50"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ARTICLE EDITOR MODAL */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingArticleId ? 'Edit Article' : 'Create New Article'}
      >
        <div className="space-y-4 text-left text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SAFA Winter Warmth Drive: Delivering Heating to 200 Families"
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
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="Field Updates">Field Updates</option>
                <option value="Community Stories">Community Stories</option>
                <option value="Youth Initiatives">Youth Initiatives</option>
                <option value="Emergency Relief">Emergency Relief</option>
                <option value="Announcements">Announcements</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Chilanzar District, Tashkent"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Brief Excerpt / Summary (for previews)
            </label>
            <textarea
              rows={2}
              placeholder="A concise summary of what this article covers..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Full Article Content
            </label>
            <textarea
              rows={8}
              placeholder="Write the full report here. Paragraphs and line breaks are preserved..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52] font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                placeholder="Upload an authentic SAFA image URL"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Optional Field Video (YouTube URL)
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Warmth, Winter, Food Aid, Elderly"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          {/* Workflow Action Buttons */}
          <div className="pt-4 border-t border-[#E5E0D5] flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>

            {/* Save as Draft */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSaveArticle('draft')}
            >
              Save as Draft
            </Button>

            {/* Submit for Review (if not direct publisher) */}
            {!canPublishDirectly && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveArticle('submitted')}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Submit for Editorial Review
              </Button>
            )}

            {/* Publish directly (if Editor or Super Admin) */}
            {canPublishDirectly && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSaveArticle('published')}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Publish Live Immediately
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* REVISION NOTES MODAL */}
      <Modal
        isOpen={isReviewNotesModalOpen}
        onClose={() => setIsReviewNotesModalOpen(false)}
        title="Editorial Revision Request"
      >
        <div className="space-y-4 text-left text-xs">
          <p className="text-xs text-[#6D6A61]">
            Please enter constructive guidance for the content author explaining what needs adjustment before this article can be approved for public release.
          </p>
          <textarea
            rows={4}
            required
            placeholder="e.g. Please verify beneficiary photo permissions and adjust wording regarding the heating equipment model..."
            value={reviewNotesInput}
            onChange={e => setReviewNotesInput(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewNotesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmReject}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              Send Revision Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* ARTICLE PREVIEW MODAL */}
      {selectedArticle && isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Preview: ${selectedArticle.title}`}
        >
          <div className="space-y-4 text-left text-xs max-h-[80vh] overflow-y-auto pr-1">
            <div className="h-56 rounded-2xl overflow-hidden bg-[#F1EDE4]">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#F1EDE4] text-[#6D6A61]">
                {selectedArticle.category}
              </span>
              {getStatusBadge(selectedArticle.status)}
              <span className="text-[#6D6A61]">• {new Date(selectedArticle.date).toLocaleDateString()}</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#3D3B36]">
              {selectedArticle.title}
            </h3>
            <p className="text-xs text-[#6D6A61] italic">
              {selectedArticle.excerpt}
            </p>
            <div className="prose prose-stone text-xs leading-relaxed whitespace-pre-line text-[#3D3B36] pt-2 border-t border-[#E5E0D5]">
              {selectedArticle.content}
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-[#E5E0D5]">
              <span className="text-[11px] text-[#6D6A61]">Author: {selectedArticle.author}</span>
              <Button size="sm" variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
