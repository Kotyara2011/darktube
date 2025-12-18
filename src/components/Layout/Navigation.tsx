'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useTheme, useNotifications } from '@/app/providers';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toggleSidebar, sidebarCollapsed } = useTheme();
  const { addNotification } = useNotifications();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to upload videos',
      });
      router.push('/auth/login');
      return;
    }
    router.push('/studio/upload');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dt-black border-b border-dt-charcoal">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-dt-light-gray hover:text-dt-orange transition-colors rounded-lg hover:bg-dt-dark-gray"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 text-dt-orange hover:text-dt-orange-muted transition-colors"
          >
            <div className="w-8 h-8 bg-dt-orange rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-xl font-bold hidden sm:block">DarkTube</span>
          </button>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className="hidden sm:flex items-center space-x-2 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload</span>
          </button>

          {/* Mobile Upload Button */}
          <button
            onClick={handleUploadClick}
            className="sm:hidden p-2 text-dt-light-gray hover:text-dt-orange transition-colors rounded-lg hover:bg-dt-dark-gray"
            aria-label="Upload video"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <UserMenu user={user!} />
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <Link
                href="/auth/login"
                className="btn-ghost hidden sm:block"
              >
                Sign In
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-dt-light-gray hover:text-dt-orange transition-colors rounded-lg hover:bg-dt-dark-gray"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && !isAuthenticated && (
        <div className="sm:hidden border-t border-dt-charcoal bg-dt-charcoal">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/auth/login"
              className="block w-full text-left px-4 py-2 text-dt-white hover:text-dt-orange hover:bg-dt-dark-gray rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="block w-full text-left px-4 py-2 text-dt-white hover:text-dt-orange hover:bg-dt-dark-gray rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};