import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';
import { storage } from '../services/storage';
import { User } from '../types';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminTeamTab } from '../components/admin/AdminTeamTab';
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

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/admin/login');
    } else {
      setCurrentUser(auth.getCurrentUser());
    }
  }, [navigate]);

  if (!currentUser || !auth.isAuthenticated()) return null;

  const handleUserSwitch = (newUser: User) => {
    auth.login(newUser);
    setCurrentUser(newUser);
    // If switching away from super admin and on team tab, switch to overview
    if (newUser.role !== 'super_admin' && activeTab === 'team') {
      setActiveTab('overview');
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white text-[#021024] flex flex-col font-sans">
      {/* Top Admin Header with User info & quick staff simulation switcher */}
      <AdminHeader
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        onLogout={handleLogout}
      />

      {/* Main Admin App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Aware Navigation Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
        />

        {/* Dynamic CMS Tab Viewport */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl">
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

          {activeTab === 'team' && (
            <AdminTeamTab
              key={refreshKey}
              currentUser={currentUser}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditLogsTab key={refreshKey} />
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
