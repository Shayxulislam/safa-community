import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const MissionPage = lazy(() => import('./pages/MissionPage').then(module => ({ default: module.MissionPage })));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then(module => ({ default: module.ProgramsPage })));
const PieceOfWorkPage = lazy(() => import('./pages/PieceOfWorkPage').then(module => ({ default: module.PieceOfWorkPage })));
const WorkDetailPage = lazy(() => import('./pages/WorkDetailPage').then(module => ({ default: module.WorkDetailPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(module => ({ default: module.SupportPage })));
const ContributionSuccessPage = lazy(() => import('./pages/ContributionSuccessPage').then(module => ({ default: module.ContributionSuccessPage })));
const ContributionHistoryPage = lazy(() => import('./pages/ContributionHistoryPage').then(module => ({ default: module.ContributionHistoryPage })));
const ImpactPage = lazy(() => import('./pages/ImpactPage').then(module => ({ default: module.ImpactPage })));
const StoriesPage = lazy(() => import('./pages/StoriesPage').then(module => ({ default: module.StoriesPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(module => ({ default: module.HistoryPage })));
const LinksPage = lazy(() => import('./pages/LinksPage').then(module => ({ default: module.LinksPage })));
const VolunteerPage = lazy(() => import('./pages/VolunteerPage').then(module => ({ default: module.VolunteerPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const TransparencyPage = lazy(() => import('./pages/TransparencyPage').then(module => ({ default: module.TransparencyPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage').then(module => ({ default: module.AccessibilityPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { Navigate } from 'react-router-dom';
const ArticlesPage = lazy(() => import('./pages/ArticlesPage').then(module => ({ default: module.ArticlesPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(module => ({ default: module.EventsPage })));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage').then(module => ({ default: module.ArticleDetailPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(module => ({ default: module.EventDetailPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
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
      { '@type': 'BreadcrumbList', itemListElement: pathname === '/' ? [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://safa-community.vercel.app/' }] : [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://safa-community.vercel.app/' }, { '@type': 'ListItem', position: 2, name: title.replace(' | SAFA', ''), item: `https://safa-community.vercel.app${pathname}` }] }
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
          <Suspense fallback={<div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-[#6D6A61]">Loading page...</div>}>
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
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/invite/:token" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
