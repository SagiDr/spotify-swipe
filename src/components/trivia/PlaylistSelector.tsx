"use client";

import { PlaylistSummary } from "@/types";
import { motion } from "framer-motion";

interface Props {
  playlists: PlaylistSummary[];
  onSelect: (playlist: PlaylistSummary) => void;
  loading: boolean;
}

export default function PlaylistSelector({ playlists, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Pick a Playlist</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
        Choose a playlist to test your music knowledge
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {playlists.map((playlist, i) => (
          <motion.button
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(playlist)}
            className="bg-gray-100 dark:bg-spotify-lightgray rounded-xl p-3 text-left hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
          >
            {playlist.imageUrl ? (
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-full aspect-square object-cover rounded-lg mb-2"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <p className="font-medium text-sm truncate">{playlist.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {playlist.trackCount} tracks
            </p>
          </motion.button>
        ))}
      </div>

      {playlists.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No playlists found with 4+ tracks. Create some playlists on Spotify first!
        </p>
      )}
    </div>
  );
}
