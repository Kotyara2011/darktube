'use client';

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dt-black">
      <div className="pt-4 pb-8">
        {/* Welcome Message */}
        <div className="mb-8 px-6">
          <div className="bg-gradient-to-r from-dt-orange to-dt-orange-muted rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome to DarkTube</h1>
            <p className="text-lg opacity-90 mb-4">
              Dive deeper into content that matters. Discover videos from creators who prioritize quality over clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/auth/register" className="btn-secondary bg-white text-dt-orange hover:bg-gray-100">
                Sign Up
              </a>
              <a href="/trending" className="btn-ghost border-white text-white hover:bg-white hover:text-dt-orange">
                Explore Trending
              </a>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="text-6xl">📺</div>
          <div className="text-dt-white text-xl font-semibold">DarkTube Platform</div>
          <div className="text-dt-light-gray text-center max-w-md">
            Your video-sharing platform with dark theming is ready for development.
          </div>
        </div>
      </div>
    </div>
  );
}