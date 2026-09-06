import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, LogOut, ChevronDown, UserCheck, Key } from 'lucide-react';
import { User } from '../../types';
import { ROLE_DETAILS, auth } from '../../services/auth';
import { storage } from '../../services/storage';
import { SafaLogo } from '../ui/SafaLogo';

interface AdminHeaderProps {
  currentUser: User;
  onUserSwitch: (user: User) => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  onUserSwitch,
  onLogout
}) => {
  const allUsers = storage.getUsers();
  const roleMeta = ROLE_DETAILS[currentUser.role] || {
    title: currentUser.role,
    badgeColor: 'bg-[#5E6E52] text-white',
    description: ''
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCF9] border-b border-[#E5E0D5] px-4 sm:px-6 py-3 shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & CMS Identifier */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] border border-[#BFDBFE] flex items-center justify-center p-1">
              <SafaLogo variant="mark" size={22} color="#0056D2" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif font-black text-base text-[#172033]">SAFA CMS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[#EBF3FC] text-[#0056D2]">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">Admin Management System</p>
            </div>
          </Link>

          <div className="hidden md:block h-6 w-px bg-[#E5E0D5] mx-1" />

          {/* Quick Staff Switcher for demo & verification */}
          <div className="flex items-center gap-2 bg-[#F1EDE4] px-3 py-1.5 rounded-xl border border-[#E5E0D5]">
            <span className="text-[11px] font-semibold text-[#6D6A61] hidden lg:inline">
              Simulate Account:
            </span>
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = allUsers.find(u => u.id === e.target.value);
                  if (targetUser) onUserSwitch(targetUser);
                }}
                className="bg-white text-xs font-semibold text-[#3D3B36] py-1 pl-2.5 pr-7 rounded-lg border border-[#E5E0D5] cursor-pointer outline-hidden focus:border-[#5E6E52]"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({ROLE_DETAILS[u.role]?.title || u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Current User Pill & Actions */}
        <div className="flex items-center gap-3">
          {/* Role badge pill */}
          <div className="flex items-center gap-2.5 bg-[#F1EDE4] py-1.5 px-3 rounded-full border border-[#E5E0D5]">
            {currentUser.role === 'super_admin' ? (
              <img
                src="/ceo.png"
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover object-top border border-white shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#5E6E52] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-[#3D3B36] flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${roleMeta.badgeColor}`}>
                  {roleMeta.title}
                </span>
              </div>
            </div>
          </div>

          {/* View Public Website */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D5] text-xs font-semibold text-[#3D3B36] hover:bg-[#F1EDE4] transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6D6A61]" />
          </Link>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D5] text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
