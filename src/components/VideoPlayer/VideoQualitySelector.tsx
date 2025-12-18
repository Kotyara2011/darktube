'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VideoQualitySelectorProps {
  currentQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
}

const qualityLabels: Record<string, string> = {
  'auto': 'Auto',
  '144p': '144p',
  '240p': '240p',
  '360p': '360p',
  '480p': '480p',
  '720p': '720p HD',
  '1080p': '1080p HD',
  '1440p': '1440p QHD',
  '2160p': '4K UHD',
  '4K': '4K UHD'
};

const qualityOrder = ['4K', '2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p', 'auto'];

export const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  currentQuality,
  availableQualities,
  onQualityChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort qualities by preference order
  const sortedQualities = availableQualities.sort((a, b) => {
    const aIndex = qualityOrder.indexOf(a);
    const bIndex = qualityOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQualitySelect = (quality: string) => {
    onQualityChange(quality);
    setIsOpen(false);
  };

  const getCurrentQualityLabel = () => {
    return qualityLabels[currentQuality] || currentQuality;
  };

  const getQualityIcon = (quality: string) => {
    if (quality === 'auto') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }

    // HD/4K indicators
    if (quality.includes('1080p') || quality.includes('720p')) {
      return (
        <div className="text-xs font-bold bg-dt-orange text-white px-1 rounded">
          HD
        </div>
      );
    }

    if (quality.includes('4K') || quality.includes('2160p') || quality.includes('1440p')) {
      return (
        <div className="text-xs font-bold bg-dt-orange text-white px-1 rounded">
          4K
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Quality Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-dt-orange transition-colors p-2 rounded"
        aria-label="Select video quality"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm">{getCurrentQualityLabel()}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Quality Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-dt-dark-gray border border-dt-charcoal rounded-lg shadow-lg min-w-48 z-50">
          <div className="py-2">
            <div className="px-3 py-2 text-dt-light-gray text-xs font-semibold uppercase tracking-wide border-b border-dt-charcoal">
              Quality
            </div>
            
            {sortedQualities.map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualitySelect(quality)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-dt-charcoal transition-colors ${
                  quality === currentQuality 
                    ? 'text-dt-orange bg-dt-orange bg-opacity-10' 
                    : 'text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {getQualityIcon(quality)}
                  <span className="text-sm">{qualityLabels[quality] || quality}</span>
                </div>
                
                {quality === currentQuality && (
                  <svg className="w-4 h-4 text-dt-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Quality Info */}
          <div className="border-t border-dt-charcoal px-3 py-2">
            <div className="text-dt-light-gray text-xs">
              {currentQuality === 'auto' ? (
                'Quality adjusts automatically based on your connection'
              ) : (
                `Currently playing in ${getCurrentQualityLabel()}`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};