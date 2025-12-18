'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchAnalytics } from '@/hooks/useVideoAnalytics';
import { debounce } from 'lodash';

interface SearchSuggestion {
  type: 'query' | 'video' | 'channel';
  text: string;
  id?: string;
  thumbnail?: string;
  metadata?: string;
}

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const { trackSearch, trackSearchClick } = useSearchAnalytics();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setShowSuggestions(true);
      debouncedGetSuggestions(value.trim());
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query.trim();
    if (!finalQuery) return;

    setShowSuggestions(false);
    trackSearch(finalQuery, 0); // Results count will be updated on search page
    router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'video' && suggestion.id) {
      trackSearchClick(query, suggestion.id, suggestions.indexOf(suggestion));
      router.push(`/watch?v=${suggestion.id}`);
    } else if (suggestion.type === 'channel' && suggestion.id) {
      router.push(`/channel/${suggestion.id}`);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setShowSuggestions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus/blur
  const handleFocus = () => {
    if (query.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'channel':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search videos, channels, and more..."
          className="input-search w-full pl-4 pr-12"
        />
        
        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-dt-light-gray hover:text-dt-orange transition-colors rounded-lg hover:bg-dt-dark-gray"
          aria-label="Search"
        >
          {isLoading ? (
            <div className="w-5 h-5 spinner border-2"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-dt-dark-gray border border-dt-charcoal rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-dt-charcoal transition-colors ${
                index === selectedIndex ? 'bg-dt-charcoal' : ''
              }`}
            >
              {/* Icon */}
              <div className="text-dt-light-gray flex-shrink-0">
                {getSuggestionIcon(suggestion.type)}
              </div>

              {/* Thumbnail (for videos/channels) */}
              {suggestion.thumbnail && (
                <img
                  src={suggestion.thumbnail}
                  alt=""
                  className="w-10 h-6 object-cover rounded flex-shrink-0"
                />
              )}

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="text-dt-white truncate">{suggestion.text}</div>
                {suggestion.metadata && (
                  <div className="text-dt-light-gray text-sm truncate">
                    {suggestion.metadata}
                  </div>
                )}
              </div>

              {/* Type Badge */}
              {suggestion.type !== 'query' && (
                <div className="text-xs text-dt-light-gray capitalize flex-shrink-0">
                  {suggestion.type}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};