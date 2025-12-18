'use client';

import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';

function WatchPageContent() {
  return (
    <div className="min-h-screen bg-dt-black">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Placeholder */}
            <div className="w-full aspect-video bg-dt-dark-gray rounded-lg flex items-center justify-center">
              <div className="text-dt-white text-xl">Video Player</div>
            </div>

            {/* Video Info Placeholder */}
            <div className="bg-dt-dark-gray rounded-lg p-4">
              <h1 className="text-dt-white text-2xl font-bold mb-2">Sample Video Title</h1>
              <div className="text-dt-light-gray">Video information will appear here</div>
            </div>

            {/* Comments Placeholder */}
            <div className="bg-dt-dark-gray rounded-lg p-4">
              <h3 className="text-dt-white text-xl font-semibold mb-4">Comments</h3>
              <div className="text-dt-light-gray">Comments will appear here</div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="text-dt-white text-lg font-semibold mb-4">Up Next</h3>
              <div className="text-dt-light-gray text-center py-8">
                Related videos will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-dt-black">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  );
}