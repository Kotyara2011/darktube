'use client';

import React, { useState, useEffect } from 'react';

interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

interface VideoSubtitlesProps {
  videoId: string;
  currentTime: number;
  language: string;
  className?: string;
}

export const VideoSubtitles: React.FC<VideoSubtitlesProps> = ({
  videoId,
  currentTime,
  language,
  className = ''
}) => {
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subtitles
  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/videos/${videoId}/subtitles?lang=${language}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to load subtitles');
        }

        // Parse VTT or SRT format
        const parsedSubtitles = parseSubtitles(data.content, data.format);
        setSubtitles(parsedSubtitles);
      } catch (error) {
        console.error('Error loading subtitles:', error);
        setError(error instanceof Error ? error.message : 'Failed to load subtitles');
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId && language) {
      loadSubtitles();
    }
  }, [videoId, language]);

  // Update current subtitle based on time
  useEffect(() => {
    const currentSub = subtitles.find(
      sub => currentTime >= sub.start && currentTime <= sub.end
    );
    
    setCurrentSubtitle(currentSub?.text || '');
  }, [currentTime, subtitles]);

  const parseSubtitles = (content: string, format: 'vtt' | 'srt'): SubtitleSegment[] => {
    const segments: SubtitleSegment[] = [];
    
    if (format === 'vtt') {
      return parseVTT(content);
    } else if (format === 'srt') {
      return parseSRT(content);
    }
    
    return segments;
  };

  const parseVTT = (content: string): SubtitleSegment[] => {
    const segments: SubtitleSegment[] = [];
    const lines = content.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
        i++;
        continue;
      }
      
      // Look for timestamp line
      const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
      if (timestampMatch) {
        const start = parseVTTTime(timestampMatch[1]);
        const end = parseVTTTime(timestampMatch[2]);
        
        // Collect subtitle text
        const textLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i].trim());
          i++;
        }
        
        if (textLines.length > 0) {
          segments.push({
            start,
            end,
            text: textLines.join(' ')
          });
        }
      }
      
      i++;
    }
    
    return segments;
  };

  const parseSRT = (content: string): SubtitleSegment[] => {
    const segments: SubtitleSegment[] = [];
    const blocks = content.split('\n\n');
    
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;
      
      // Skip sequence number (first line)
      const timestampLine = lines[1];
      const timestampMatch = timestampLine.match(/^(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      
      if (timestampMatch) {
        const start = parseSRTTime(timestampMatch[1]);
        const end = parseSRTTime(timestampMatch[2]);
        const text = lines.slice(2).join(' ');
        
        segments.push({ start, end, text });
      }
    }
    
    return segments;
  };

  const parseVTTTime = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(':');
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
  };

  const parseSRTTime = (timeString: string): number => {
    const [time, milliseconds] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':');
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  };

  const formatSubtitleText = (text: string): React.ReactNode => {
    // Handle basic formatting tags
    return text
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .split('\n')
      .map((line, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
      ));
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (error) {
    return null; // Silently fail for subtitles
  }

  if (!currentSubtitle) {
    return null; // No subtitle to show
  }

  return (
    <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 ${className}`}>
      <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg max-w-2xl text-center">
        <div 
          className="text-lg leading-relaxed"
          style={{
            textShadow: '2px 2px 4px rgba(255, 102, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500'
          }}
        >
          {formatSubtitleText(currentSubtitle)}
        </div>
      </div>
    </div>
  );
};