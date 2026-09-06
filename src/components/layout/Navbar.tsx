import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart,
  Menu,
  X,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronDown,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { SafaLogo } from '../ui/SafaLogo';
import { auth } from '../../services/auth';
import { storage } from '../../services/storage';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const location = useLocation();
  const isAuth = auth.isAuthenticated();
  const currentUser = isAuth ? auth.getCurrentUser() : null;
  const activeAnnouncement = storage.getActiveAnnouncement();
  const socials = storage.getSocialLinks();
  const telegramLink = socials.find(s => s.platform === 'telegram' && s.enabled) || {
    url: 'https://t.me/SafaUzbekistan',
    handle: '@SafaUzbekistan'
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Our Work', path: '/work' },
    { name: 'Articles', path: '/articles' },
    { name: 'Events', path: '/events' },
    { name: 'Impact', path: '/impact' },
    { name: 'Stories', path: '/stories' },
    { name: 'Transparency', path: '/transparency' },
    { name: 'Links', path: '/links' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Dynamic CMS Announcement Banner (if active) */}
      {activeAnnouncement && !announcementDismissed && (
        <div className="bg-[#052659] text-white py-2 px-4 text-xs font-medium border-b border-[#021024]/30 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="p-1 rounded-full bg-white/20 shrink-0">
                <Bell className="w-3 h-3 text-white" />
              </span>
              <div className="truncate">
                <strong className="mr-1">{activeAnnouncement.title}:</strong>
                <span className="text-white/90">{activeAnnouncement.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {activeAnnouncement.linkUrl && (
                <Link
                  to={activeAnnouncement.linkUrl}
                  className="font-bold underline text-white hover:text-[#F1EDE4] flex items-center gap-1 text-[11px] uppercase tracking-wider"
                >
                  {activeAnnouncement.linkText || 'Learn More'} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              <button
                onClick={() => setAnnouncementDismissed(true)}
                className="text-white/80 hover:text-white p-0.5"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top verified organizational banner */}
      <div className="bg-[#021024] text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F1EDE4] animate-pulse" />
            <span className="tracking-wide">SAFA Community Initiative • Verified updates published by the team</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[#FDFCF9]/85">
            <a
              href={telegramLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Telegram: {telegramLink.handle || '@SafaUzbekistan'}</span>
            </a>
            <span>•</span>
            <Link
              to={currentUser ? "/admin/dashboard" : "/admin/login"}
              className="hover:text-white flex items-center gap-1 transition-colors underline-offset-2 hover:underline font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser ? `Admin CMS (${currentUser.name})` : 'Portal Login'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`w-full bg-white/95 backdrop-blur-md transition-all duration-200 ${
          isScrolled ? 'shadow-xs border-b border-[#C1E8FF]' : 'border-b border-[#C1E8FF]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus-visible:outline-[#0056D2] rounded-xl p-1 -ml-1">
            <div className="w-11 h-11 rounded-2xl bg-[#C1E8FF] border border-[#7DA0CA] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1.5">
              <SafaLogo variant="mark" size={32} color="#0056D2" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-serif font-black tracking-tight text-[#021024]">SAFA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]">UZB</span>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium leading-none mt-0.5">Connecting Hands, Changing Lives</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-[#052659] font-bold shadow-2xs'
                      : 'text-[#5483B3] hover:text-[#021024] hover:bg-[#C1E8FF]/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/volunteer">
              <Button variant="outline" size="sm">
                Volunteer
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="primary" size="md" icon={<Heart className="w-4 h-4 fill-white" />}>
                Support SAFA
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl text-[#3D3B36] hover:bg-[#F1EDE4] focus-visible:outline-[#5E6E52]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#FDFCF9] border-b border-[#E5E0D5] shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2.5 rounded-xl text-base font-medium ${
                    isActive
                      ? 'text-[#5E6E52] bg-[#F1EDE4] font-bold'
                      : 'text-[#3D3B36] hover:bg-[#F1EDE4]/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E0D5] space-y-2">
            <Link to="/support" className="block w-full">
              <Button variant="primary" size="lg" className="w-full" icon={<Heart className="w-4 h-4 fill-white" />}>
                Support SAFA
              </Button>
            </Link>
            <Link to="/volunteer" className="block w-full">
              <Button variant="outline" size="md" className="w-full">
                Apply to Volunteer
              </Button>
            </Link>
            <div className="pt-2 text-center">
              <Link
                to={currentUser ? "/admin" : "/admin/login"}
                className="text-xs text-[#6D6A61] hover:text-[#5E6E52] inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentUser ? `Admin Portal (${currentUser.role})` : 'Authorized Staff Login'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
