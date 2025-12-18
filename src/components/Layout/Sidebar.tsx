'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useTheme } from '@/app/providers';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const mainItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'trending',
    label: 'Trending',
    href: '/trending',
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    href: '/subscriptions',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

const libraryItems: SidebarItem[] = [
  {
    id: 'library',
    label: 'Library',
    href: '/library',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    href: '/history',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'watch-later',
    label: 'Watch Later',
    href: '/watch-later',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'liked-videos',
    label: 'Liked Videos',
    href: '/liked',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

const creatorItems: SidebarItem[] = [
  {
    id: 'studio',
    label: 'Creator Studio',
    href: '/studio',
    requiresAuth: true,
    icon: (
      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { sidebarCollapsed } = useTheme();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: SidebarItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      return null;
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
      >
        {item.icon}
        {!sidebarCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-dt-black border-r border-dt-charcoal transition-all duration-300 z-30 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {/* Main Items */}
          <div className="space-y-1">
            {mainItems.map(renderNavItem)}
          </div>

          {/* Divider */}
          {!sidebarCollapsed && (
            <div className="border-t border-dt-charcoal my-4"></div>
          )}

          {/* Library Section */}
          {isAuthenticated && (
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-4 py-2 text-dt-light-gray text-sm font-semibold uppercase tracking-wide">
                  Library
                </div>
              )}
              {libraryItems.map(renderNavItem)}
            </div>
          )}

          {/* Divider */}
          {isAuthenticated && !sidebarCollapsed && (
            <div className="border-t border-dt-charcoal my-4"></div>
          )}

          {/* Creator Section */}
          {isAuthenticated && (
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-4 py-2 text-dt-light-gray text-sm font-semibold uppercase tracking-wide">
                  Creator
                </div>
              )}
              {creatorItems.map(renderNavItem)}
            </div>
          )}

          {/* Subscriptions List */}
          {isAuthenticated && !sidebarCollapsed && (
            <>
              <div className="border-t border-dt-charcoal my-4"></div>
              <div className="space-y-1">
                <div className="px-4 py-2 text-dt-light-gray text-sm font-semibold uppercase tracking-wide">
                  Subscriptions
                </div>
                {/* This would be populated with user's subscriptions */}
                <div className="px-4 py-2 text-dt-light-gray text-sm">
                  No subscriptions yet
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-t border-dt-charcoal">
            <div className="text-dt-light-gray text-xs space-y-2">
              <div className="flex flex-wrap gap-2">
                <Link href="/about" className="hover:text-dt-orange transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="hover:text-dt-orange transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-dt-orange transition-colors">
                  Terms
                </Link>
              </div>
              <div className="text-dt-light-gray">
                © 2024 DarkTube
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};