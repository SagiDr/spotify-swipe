"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Track } from "@/types";
import SwipeStack from "@/components/SwipeStack";
import { useSettings } from "@/components/SettingsProvider";

export default function SwipePage() {
  const router = useRouter();
  const { language } = useSettings();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songCount, setSongCount] = useState(20);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWithTimeout(url: string, timeoutMs: number) {
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal });
        return res;
      } finally {
        clearTimeout(timeout);
      }
    }

    async function fetchSongs(retries = 2) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetchWithTimeout(
            `/api/songs?language=${language}&count=35`,
            30000 // 30s total timeout for the whole request
          );
          if (res.status === 401) {
            setError("Not logged in. Please log in with Spotify first.");
            return;
          }
          if (!res.ok) throw new Error("Failed to fetch songs");
          const data = await res.json();
          if (!data.songs || data.songs.length === 0) {
            throw new Error("No songs returned");
          }
          setTracks(data.songs);
          return;
        } catch (e) {
          if (controller.signal.aborted) return; // component unmounted
          if (attempt < retries) {
            // Wait briefly before retrying
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      }
      setLoading(false);
    }

    fetchSongs().finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [language]);

  const handleComplete = async (likedTrackIds: string[]) => {
    if (likedTrackIds.length === 0) {
      router.push("/result?error=no_likes");
      return;
    }

    try {
      const likedTracks = tracks.filter((t) => likedTrackIds.includes(t.id));

      const recRes = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedTracks }),
      });

      if (!recRes.ok) throw new Error("Failed to get recommendations");
      const { tracks: recommendedTracks } = await recRes.json();

      const trackUris = recommendedTracks.map((t: Track) => t.uri);
      const playlistRes = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris }),
      });

      if (!playlistRes.ok) throw new Error("Failed to create playlist");
      const playlistData = await playlistRes.json();

      const params = new URLSearchParams({
        url: playlistData.playlistUrl,
        name: playlistData.playlistName,
        count: playlistData.trackCount.toString(),
      });
      router.push(`/result?${params}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto animate-spin text-spotify-green mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Loading songs...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
          <a
            href="/api/auth/login"
            className="inline-block px-6 py-3 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full transition-colors mb-3"
          >
            Login with Spotify
          </a>
          <br />
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 dark:bg-spotify-lightgray hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Setup screen with slider
  if (!started) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-spotify-green flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2">Ready to swipe?</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10">
            Choose how many songs you want to swipe through
          </p>

          {/* Song count slider */}
          <div className="bg-gray-100 dark:bg-spotify-lightgray rounded-2xl p-8 mb-8">
            <div className="text-6xl font-bold text-spotify-green mb-2">
              {songCount}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-6">songs</div>

            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={songCount}
              onChange={(e) => setSongCount(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-spotify-green bg-gray-300 dark:bg-gray-600"
              style={{
                background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${((songCount - 10) / 25) * 100}%, ${
                  typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB"
                } ${((songCount - 10) / 25) * 100}%, ${
                  typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#4B5563" : "#D1D5DB"
                } 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>10</span>
              <span>35</span>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-4 px-8 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full text-lg transition-colors"
          >
            Start Swiping
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center px-4 py-2 sm:py-6 overflow-hidden">
      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 shrink-0">
        Swipe to discover your taste
      </h1>
      <SwipeStack tracks={tracks.slice(0, songCount)} onComplete={handleComplete} />
    </main>
  );
}
