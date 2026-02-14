"use client";

import { motion } from "framer-motion";

interface PlaylistResultProps {
  playlistUrl: string;
  playlistName: string;
  trackCount: number;
}

export default function PlaylistResult({
  playlistUrl,
  playlistName,
  trackCount,
}: PlaylistResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-spotify-green flex items-center justify-center"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </motion.div>

        <h2 className="text-3xl font-bold mb-2">
          Playlist Created!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          <span className="text-spotify-green font-semibold">{playlistName}</span>
          {" "}with {trackCount} tracks
        </p>
      </div>

      <div className="space-y-4">
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 px-6 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full text-lg transition-colors"
        >
          Open in Spotify
        </a>

        <a
          href="/swipe"
          className="block w-full py-4 px-6 bg-gray-200 dark:bg-spotify-lightgray hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-full text-lg transition-colors"
        >
          Start Over
        </a>
      </div>
    </motion.div>
  );
}
