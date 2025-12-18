'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme, useNotifications } from '@/app/providers';
import { User } from '@/types';

interface UserMenuProps {
  user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const { addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    addNotification({
      type: 'success',
      title: 'Signed Out',
      message: 'You have been successfully signed out',
    });
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  const handleStudioClick = () => {
    setIsOpen(false);
    router.push('/studio');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    addNotification({
      type: 'info',
      title: 'Theme Changed',
      message: `Switched to ${theme === 'dark' ? 'light' : 'dark'} theme`,
      duration: 2000,
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-dt-dark-gray transition-colors"
        aria-label="User menu"
      >
        <img
          src={user.profileAvatar || '/default-avatar.png'}
          alt={user.username}
          className="w-8 h-8 rounded-full border-2 border-dt-orange object-cover"
        />
        {/* Username (hidden on mobile) */}
        <span className="hidden md:block text-dt-white text-sm font-medium">
          {user.username}
        </span>
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-dt-light-gray transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-dt-dark-gray border border-dt-charcoal rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-dt-charcoal">
            <div className="flex items-center space-x-3">
              <img
                src={user.profileAvatar || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-dt-orange object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-dt-white font-medium truncate">
                  {user.username}
                </div>
                <div className="text-dt-light-gray text-sm truncate">
                  {user.email}
                </div>
                {user.isVerifiedCreator && (
                  <div className="flex items-center space-x-1 mt-1">
                    <svg className="w-4 h-4 text-dt-orange" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span className="text-dt-orange text-xs font-medium">Verified Creator</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={handleProfileClick}
              className="dropdown-item w-full flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Your Profile</span>
            </button>

            {/* Creator Studio */}
            <button
              onClick={handleStudioClick}
              className="dropdown-item w-full flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Creator Studio</span>
            </button>

            {/* Settings */}
            <button
              onClick={handleSettingsClick}
              className="dropdown-item w-full flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="border-t border-dt-charcoal my-2"></div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="dropdown-item w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>Dark Theme</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-dt-orange' : 'bg-dt-charcoal'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                }`}></div>
              </div>
            </button>

            {/* Help & Feedback */}
            <Link
              href="/help"
              className="dropdown-item flex items-center space-x-3"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help & Feedback</span>
            </Link>

            {/* Divider */}
            <div className="border-t border-dt-charcoal my-2"></div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="dropdown-item w-full flex items-center space-x-3 text-dt-red hover:text-dt-red"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};