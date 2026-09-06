import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  FolderPlus,
  Play,
  Calendar,
  MapPin
} from 'lucide-react';
import { PhotoAlbum, VideoItem, MediaAsset, User } from '../../types';
import { storage } from '../../services/storage';
import { auth } from '../../services/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AdminMediaTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminMediaTab: React.FC<AdminMediaTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [subView, setSubView] = useState<'albums' | 'videos' | 'assets'>('albums');

  const photoAlbums = storage.getPhotoAlbums();
  const videos = storage.getVideos();
  const mediaAssets = storage.getMediaAssets();

  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Album Modal State
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCategory, setAlbumCategory] = useState('Home Visits');
  const [albumLocation, setAlbumLocation] = useState('Tashkent, Uzbekistan');
  const [albumCover, setAlbumCover] = useState('');
  const [albumPhotosInput, setAlbumPhotosInput] = useState(
    ''
  );

  // New Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoCategory, setVideoCategory] = useState('Field Dispatch');

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    showNotice('Media link copied to clipboard!');
  };

  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    const photosList = albumPhotosInput
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean)
      .map((url, idx) => ({
        id: `ph-${Date.now()}-${idx}`,
        url,
        caption: `${albumTitle} archive shot #${idx + 1}`
      }));

    const newAlbum: PhotoAlbum = {
      id: `alb-${Date.now()}`,
      title: albumTitle.trim(),
      description: `${albumTitle} field photography`,
      category: albumCategory,
      location: albumLocation,
      date: new Date().toISOString().split('T')[0],
      coverImage: albumCover.trim() || photosList[0]?.url || '',
      photos: photosList,
      status: 'published',
      createdAt: new Date().toISOString()
    };

    storage.savePhotoAlbum(newAlbum, currentUser.name);
    setIsAlbumModalOpen(false);
    onRefresh();
    showNotice(`Photo album "${newAlbum.title}" created with ${newAlbum.photos.length} photos.`);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const newVid: VideoItem = {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim(),
      description: `${videoTitle} field dispatch`,
      youtubeUrl: videoUrl.trim(),
      thumbnailUrl: videoThumbnail.trim(),
      category: videoCategory,
      author: currentUser.name,
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'published'
    };

    storage.saveVideo(newVid, currentUser.name);
    setIsVideoModalOpen(false);
    onRefresh();
    showNotice(`Video "${newVid.title}" published!`);
  };

  const handleDeleteAlbum = (id: string) => {
    if (confirm('Delete this photo album?')) {
      storage.deletePhotoAlbum(id, currentUser.name);
      onRefresh();
      showNotice('Photo album removed.');
    }
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Delete this video?')) {
      storage.deleteVideo(id, currentUser.name);
      onRefresh();
      showNotice('Video removed.');
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
            <ImageIcon className="w-4 h-4" />
            <span>SAFA Media Asset Vault</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Media & Field Archives
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Curate high-resolution field photography, YouTube field dispatches, and verification archives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVideoModalOpen(true)}
            icon={<Video className="w-3.5 h-3.5" />}
          >
            + Add Video
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAlbumModalOpen(true)}
            icon={<FolderPlus className="w-3.5 h-3.5" />}
          >
            + New Photo Album
          </Button>
        </div>
      </div>

      {/* Subview Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-2 text-xs font-semibold">
        <button
          onClick={() => setSubView('albums')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subView === 'albums'
              ? 'bg-[#5E6E52] text-white shadow-xs'
              : 'text-[#6D6A61] hover:text-[#3D3B36] hover:bg-[#F1EDE4]'
          }`}
        >
          Photo Albums ({photoAlbums.length})
        </button>
        <button
          onClick={() => setSubView('videos')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subView === 'videos'
              ? 'bg-[#5E6E52] text-white shadow-xs'
              : 'text-[#6D6A61] hover:text-[#3D3B36] hover:bg-[#F1EDE4]'
          }`}
        >
          Field Videos ({videos.length})
        </button>
        <button
          onClick={() => setSubView('assets')}
          className={`px-4 py-2 rounded-xl transition-all ${
            subView === 'assets'
              ? 'bg-[#5E6E52] text-white shadow-xs'
              : 'text-[#6D6A61] hover:text-[#3D3B36] hover:bg-[#F1EDE4]'
          }`}
        >
          Media Library ({mediaAssets.length})
        </button>
      </div>

      {/* ALBUMS VIEW */}
      {subView === 'albums' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photoAlbums.map(album => (
            <Card
              key={album.id}
              className="p-4 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="h-44 rounded-2xl overflow-hidden bg-[#F1EDE4] relative">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                    {album.photos.length} photos
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#6D6A61]">
                  <span className="font-bold text-[#5E6E52] uppercase">{album.category}</span>
                  {album.location && (
                    <span className="flex items-center gap-1">
                      • <MapPin className="w-3 h-3 text-[#6D6A61]" /> {album.location}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-base text-[#3D3B36] line-clamp-1">
                  {album.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#6D6A61]">{album.photos.length} photos</span>
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="p-1.5 rounded-lg text-[#6D6A61] hover:text-red-700 hover:bg-red-50"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIDEOS VIEW */}
      {subView === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <Card
              key={video.id}
              className="p-4 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="h-44 rounded-2xl overflow-hidden bg-[#F1EDE4] relative group">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#B06D50] flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#6D6A61]">
                  <span className="font-bold text-[#B06D50] uppercase">{video.category}</span>
                  <span>• {new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#3D3B36] line-clamp-2">
                  {video.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#E5E0D5] flex items-center justify-between text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyUrl(video.id, video.youtubeUrl)}
                  icon={copiedId === video.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  Copy Video Link
                </Button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-1.5 rounded-lg text-[#6D6A61] hover:text-red-700 hover:bg-red-50"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ASSETS VIEW */}
      {subView === 'assets' && (
        <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaAssets.map(asset => (
              <div
                key={asset.id}
                className="p-3 rounded-2xl border border-[#E5E0D5] bg-[#FDFCF9] space-y-2 text-xs"
              >
                <div className="h-32 rounded-xl overflow-hidden bg-[#F1EDE4]">
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.filename}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="font-bold text-[#3D3B36] truncate">{asset.filename}</div>
                <div className="text-[11px] text-[#6D6A61] flex items-center justify-between">
                  <span>{asset.type} • {asset.size}</span>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => copyUrl(asset.id, asset.url)}
                  icon={copiedId === asset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedId === asset.id ? 'Copied' : 'Copy CDN URL'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* NEW ALBUM MODAL */}
      <Modal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        title="Create New Photo Album"
      >
        <form onSubmit={handleSaveAlbum} className="space-y-4 text-left text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Album Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chilanzar Elderly Warmth Field Drive"
              value={albumTitle}
              onChange={e => setAlbumTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Category
              </label>
              <select
                value={albumCategory}
                onChange={e => setAlbumCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              >
                <option value="Home Visits">Home Visits</option>
                <option value="Food & Medical Aid">Food & Medical Aid</option>
                <option value="Youth Mentorship">Youth Mentorship</option>
                <option value="Emergency Relief">Emergency Relief</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Location
              </label>
              <input
                type="text"
                value={albumLocation}
                onChange={e => setAlbumLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              value={albumCover}
              onChange={e => setAlbumCover(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Photo Image URLs (one per line)
            </label>
            <textarea
              rows={4}
              value={albumPhotosInput}
              onChange={e => setAlbumPhotosInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52] font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAlbumModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Photo Album
            </Button>
          </div>
        </form>
      </Modal>

      {/* NEW VIDEO MODAL */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="Publish Field Video"
      >
        <form onSubmit={handleSaveVideo} className="space-y-4 text-left text-xs">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Video Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SAFA Mini-Doc: 24 Hours in the Field"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              YouTube Video URL *
            </label>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Thumbnail Image URL
            </label>
            <input
              type="text"
              value={videoThumbnail}
              onChange={e => setVideoThumbnail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D5] bg-white text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVideoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Video
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
