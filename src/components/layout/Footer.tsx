import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Mail,
  Send,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Shield,
  FileText,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { storage } from '../../services/storage';
import { SafaLogo } from '../ui/SafaLogo';

export const Footer: React.FC = () => {
  const socials = storage.getSocialLinks().filter(s => s.enabled);

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'telegram':
        return <Send className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'email':
      case 'gmail':
        return <Mail className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-[#021024] to-[#052659] text-white pt-16 pb-12 border-t border-[#5483B3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Col 1: Brand and Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#C1E8FF] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform p-1.5">
                <SafaLogo variant="mark" size={32} color="#0056D2" />
              </div>
              <div>
                <span className="text-2xl font-serif font-black tracking-tight text-white">SAFA</span>
                <p className="text-xs text-[#C1E8FF] font-medium">Connecting Hands, Changing Lives</p>
              </div>
            </Link>
            <p className="text-sm text-[#C1E8FF] leading-relaxed mb-6 max-w-sm">
              SAFA is a youth-led community-support initiative in Uzbekistan connecting people who want to help with communities and families in need of legitimate care, inclusion, and dignity.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {socials.map(link => {
                const isMail = link.platform === 'email' || link.platform === 'gmail' || link.url.startsWith('mailto:');
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener noreferrer'}
                    className="w-9 h-9 rounded-full bg-white border border-[#C1E8FF] text-[#052659] hover:bg-[#C1E8FF] hover:text-[#021024] flex items-center justify-center transition-all shadow-xs focus-visible:outline-[#C1E8FF]"
                    title={link.title}
                  >
                    {renderSocialIcon(link.platform)}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1E8FF] mb-4">
              Explore SAFA
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C1E8FF]">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About SAFA
                </Link>
              </li>
              <li>
                <Link to="/mission" className="hover:text-[#5E6E52] transition-colors">
                  Our Mission & Values
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-[#5E6E52] transition-colors">
                  Active Programs
                </Link>
              </li>
              <li>
                <Link to="/work" className="hover:text-[#5E6E52] transition-colors">
                  Piece of Our Work
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#5E6E52] transition-colors">
                  Events & Drives
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-[#5E6E52] transition-colors">
                  Impact & Verification
                </Link>
              </li>
              <li>
                <Link to="/stories" className="hover:text-[#5E6E52] transition-colors">
                  Human Stories
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#5E6E52] transition-colors">
                  Charity History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Get Involved */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1E8FF] mb-4">
              Get Involved
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C1E8FF]">
              <li>
                <Link to="/support" className="hover:text-[#5E6E52] transition-colors font-semibold text-[#5E6E52]">
                  Support / Contribute
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-[#5E6E52] transition-colors">
                  Volunteer Application
                </Link>
              </li>
              <li>
                <Link to="/links" className="hover:text-[#5E6E52] transition-colors">
                  Official Links & QR
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#5E6E52] transition-colors">
                  Contact Coordination Team
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-[#5E6E52] transition-colors">
                  Transparency Center
                </Link>
              </li>
              <li>
                <Link to="/contributions/history" className="hover:text-[#5E6E52] transition-colors">
                  Contribution History
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Integrity & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1E8FF] mb-4">
              Trust & Integrity
            </h4>
            <div className="bg-white rounded-2xl p-5 border border-[#C1E8FF] text-xs text-[#5483B3] space-y-3 shadow-2xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#052659] shrink-0 mt-0.5" />
                <span>Zero fabricated statistics. All impact numbers verified by field visits.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#052659] shrink-0 mt-0.5" />
                <span>Beneficiary dignity respected. Zero sensationalized or pity-based marketing.</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#5483B3] shrink-0 mt-0.5" />
                <span>Public contribution ledger with server-verified references.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#5483B3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#C1E8FF] gap-4">
          <div>
            <p className="text-[11px] font-serif italic text-[#C1E8FF] mb-1">Building a more compassionate world</p>
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-70">© 2026 SAFA UZBEKISTAN • ALL RIGHTS RESERVED</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#5E6E52] transition-colors">
              Terms of Use
            </Link>
            <Link to="/accessibility" className="hover:text-[#5E6E52] transition-colors">
              Accessibility (WCAG 2.2 AA)
            </Link>
            <Link to="/admin/login" className="hover:text-[#5E6E52] transition-colors font-medium">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
