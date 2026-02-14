"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  previewUrl: string | null;
  spotifyUrl: string;
  trackId: string;
}

export default function AudioPlayer({ previewUrl, trackId }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setShowEmbed(false);
  }, [trackId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [previewUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // If preview_url exists, use native audio player
  if (previewUrl) {
    return (
      <div className="mt-4 flex items-center gap-3">
        <audio
          ref={audioRef}
          src={previewUrl}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
        />
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-spotify-green hover:bg-green-400 text-black flex items-center justify-center transition-colors shadow-lg"
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 2l9 6-9 6V2z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {isPlaying ? "Playing preview..." : "30s preview"}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-spotify-green h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // No preview_url — use Spotify embed player
  return (
    <div className="mt-4">
      {showEmbed ? (
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      ) : (
        <button
          onClick={() => setShowEmbed(true)}
          className="flex items-center gap-3 w-full px-5 py-3 rounded-full bg-spotify-green hover:bg-green-400 text-black font-semibold transition-colors shadow-lg justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 2l9 6-9 6V2z" />
          </svg>
          Play Preview
        </button>
      )}
    </div>
  );
}
