"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        {/* Logo */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-spotify-green flex items-center justify-center"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="black">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </motion.div>

          <h1 className="text-5xl font-bold mb-3">
            Spotify Swipe
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
            Swipe through 20 songs, like or skip them, and we&apos;ll create a
            personalized playlist that matches your taste.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-sm">
          <div className="bg-gray-100 dark:bg-spotify-lightgray rounded-xl p-4">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Listen to previews</p>
          </div>
          <div className="bg-gray-100 dark:bg-spotify-lightgray rounded-xl p-4">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Swipe to like</p>
          </div>
          <div className="bg-gray-100 dark:bg-spotify-lightgray rounded-xl p-4">
            <div className="text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto text-spotify-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">Get a playlist</p>
          </div>
        </div>

        {/* Login button */}
        <a
          href="/api/auth/login"
          className="inline-block w-full py-4 px-8 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full text-lg transition-colors"
        >
          Login with Spotify
        </a>

        <p className="text-gray-400 dark:text-gray-600 text-xs mt-6">
          We only access your account to create playlists. Your data stays private.
        </p>
      </motion.div>
    </main>
  );
}
