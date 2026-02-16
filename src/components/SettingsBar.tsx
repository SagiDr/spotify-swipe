"use client";

import { useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsBar() {
  const { theme, language, setTheme, setLanguage } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes("spotify_tokens"));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "spotify_tokens=; path=/; max-age=0";
    setIsLoggedIn(false);
    // Clear Spotify's session so next login allows account switching,
    // then redirect back to our home page
    const spotifyLogout = document.createElement("iframe");
    spotifyLogout.style.display = "none";
    spotifyLogout.src = "https://accounts.spotify.com/logout";
    document.body.appendChild(spotifyLogout);
    setTimeout(() => {
      document.body.removeChild(spotifyLogout);
      router.push("/");
    }, 500);
  };

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-3 z-50">
      {/* Trivia link — only when logged in */}
      {isLoggedIn && pathname !== "/trivia" && (
        <button
          onClick={() => router.push("/trivia")}
          className="p-1.5 sm:px-3 sm:py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          aria-label="Music Trivia"
          title="Music Trivia"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
          </svg>
        </button>
      )}

      {/* Logout button — only when logged in */}
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="p-1.5 sm:px-3 sm:py-2 rounded-full text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
          aria-label="Log out"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      )}

      {/* Language toggle */}
      <button
        onClick={() => setLanguage(language === "english" ? "hebrew" : "english")}
        className="px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gray-200 dark:bg-spotify-lightgray text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        {language === "english" ? "EN" : "HE"}
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-1.5 sm:p-2 rounded-full bg-gray-200 dark:bg-spotify-lightgray text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        )}
      </button>
    </div>
  );
}
