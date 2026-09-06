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
import { NotFoundPage } from './pages/NotFoundPage';

// Auto scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
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
            <Route path="/events" element={<EventsPage />} />
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
