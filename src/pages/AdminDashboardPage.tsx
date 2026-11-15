import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';
import { User } from '../types';
import { AdminPasswordChange } from '../components/admin/AdminPasswordChange';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminArticlesTab } from '../components/admin/AdminArticlesTab';
import { AdminProjectsTab } from '../components/admin/AdminProjectsTab';
import { AdminMediaTab } from '../components/admin/AdminMediaTab';
import { AdminAnnouncementsTab } from '../components/admin/AdminAnnouncementsTab';
import { AdminAuditLogsTab } from '../components/admin/AdminAuditLogsTab';
import { AdminVolunteersTab } from '../components/admin/AdminVolunteersTab';
import { AdminFinanceTab } from '../components/admin/AdminFinanceTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminSocialTab } from '../components/admin/AdminSocialTab';
import { AdminOrganizationTab } from '../components/admin/AdminOrganizationTab';
import { AdminEventsTab } from '../components/admin/AdminEventsTab';
import { AdminMessagesTab } from '../components/admin/AdminMessagesTab';
import { AdminDonationsTab } from '../components/admin/AdminDonationsTab';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.getCurrentUser());
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storageSyncError, setStorageSyncError] = useState(false);

  useEffect(() => {
    const handleStorageSyncError = () => setStorageSyncError(true);
    window.addEventListener('safa-storage-sync-error', handleStorageSyncError);
    return () => window.removeEventListener('safa-storage-sync-error', handleStorageSyncError);
  }, []);

  if (!currentUser || !auth.isAuthenticated()) return null;

  const handleLogout = async () => {
    try { await auth.logout(); navigate('/admin/login'); }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Sign-out failed. Please retry.'); }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white text-[#021024] flex flex-col font-sans">
      <AdminHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Admin App Layout */}
      <div className="relative flex-1 flex min-h-0 overflow-hidden">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-[#021024]/40 lg:hidden"
          />
        )}
        {/* Left Role-Aware Navigation Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic CMS Tab Viewport */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          {storageSyncError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <span>Some changes could not be saved to Supabase. Your browser copy is still present.</span>
            <button type="button" className="font-semibold underline" onClick={() => window.location.reload()}>Reload from Supabase</button>
          </div>}
          {activeTab === 'overview' && (
            <AdminOverviewTab
              key={refreshKey}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'articles' && (
            <AdminArticlesTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'events' && (
            <AdminEventsTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'stories' && (
            <AdminArticlesTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'media' && (
            <AdminMediaTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'volunteers' && (
            <AdminVolunteersTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'contacts' && (
            <AdminMessagesTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'donations' && (
            <AdminDonationsTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'finance' && (
            <AdminFinanceTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'reports' && (
            <AdminFinanceTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'social' && (
            <AdminSocialTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'organization' && (
            <AdminOrganizationTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditLogsTab key={refreshKey} />
          )}

          {activeTab === 'password' && (
            <div className="max-w-xl">
              <AdminPasswordChange />
            </div>
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}
        </main>
      </div>
    </div>
  );
};
