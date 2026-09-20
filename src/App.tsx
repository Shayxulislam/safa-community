import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MissionPage } from './pages/MissionPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { PieceOfWorkPage } from './pages/PieceOfWorkPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { SupportPage } from './pages/SupportPage';
import { ContributionSuccessPage } from './pages/ContributionSuccessPage';
import { ContributionHistoryPage } from './pages/ContributionHistoryPage';
import { ImpactPage } from './pages/ImpactPage';
import { StoriesPage } from './pages/StoriesPage';
import { HistoryPage } from './pages/HistoryPage';
import { LinksPage } from './pages/LinksPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { ContactPage } from './pages/ContactPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminInvitationPage } from './pages/AdminInvitationPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { EventsPage } from './pages/EventsPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SeoHead } from './components/SeoHead';

// Auto scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteSeo() {
  const { pathname } = useLocation();
  const labels: Record<string, string> = {
    '/': 'SAFA | Connecting Hands, Changing Lives',
    '/about': 'About SAFA | Community Support in Uzbekistan',
    '/mission': 'Our Mission | SAFA',
    '/programs': 'Community Programs | SAFA',
    '/work': 'Piece of Our Work | SAFA',
    '/support': 'Support SAFA',
    '/impact': 'Verified Impact | SAFA',
    '/stories': 'Community Stories | SAFA',
    '/history': 'SAFA History',
    '/volunteer': 'Volunteer with SAFA',
    '/contact': 'Contact SAFA',
    '/transparency': 'Transparency | SAFA',
    '/articles': 'Articles & Updates | SAFA',
    '/events': 'Events & Community Drives | SAFA',
    '/links': 'Official Links | SAFA',
    '/privacy': 'Privacy Policy | SAFA',
    '/terms': 'Terms of Use | SAFA',
    '/accessibility': 'Accessibility | SAFA'
  };
  const title = labels[pathname] || (pathname.startsWith('/admin') ? 'Admin Portal | SAFA' : 'SAFA | Connecting Hands, Changing Lives');
  const noindex = pathname.startsWith('/admin') || pathname.startsWith('/contributions');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: 'SAFA', url: 'https://safa-community.vercel.app/', logo: 'https://safa-community.vercel.app/safa-logo.svg' },
      { '@type': 'WebSite', name: 'SAFA', url: 'https://safa-community.vercel.app/' },
      { '@type': 'BreadcrumbList', itemListElement: pathname === '/' ? [] : [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://safa-community.vercel.app/' }, { '@type': 'ListItem', position: 2, name: title.replace(' | SAFA', ''), item: `https://safa-community.vercel.app${pathname}` }] }
    ]
  };
  return <SeoHead title={title} path={pathname} schema={schema} noindex={noindex} />;
}

export default function App() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`min-h-screen flex flex-col bg-white text-[#172033] ${highContrast ? 'contrast-125' : ''}`}>
        <RouteSeo />
        {/* Navigation */}
        <Navbar />

        {/* Main Content View */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/work" element={<PieceOfWorkPage />} />
            <Route path="/work/:slug" element={<WorkDetailPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/contributions/success" element={<ContributionSuccessPage />} />
            <Route path="/contributions/history" element={<ContributionHistoryPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/invite/:token" element={<AdminInvitationPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
