"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Track } from "@/types";
import SwipeCard from "./SwipeCard";
import ActionButtons from "./ActionButtons";

interface SwipeStackProps {
  tracks: Track[];
  onComplete: (likedTrackIds: string[]) => void;
}

export default function SwipeStack({ tracks, onComplete }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const track = tracks[currentIndex];
      if (!track) return;

      if (direction === "right") {
        setLikedIds((prev) => [...prev, track.id]);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= tracks.length) {
        setTimeout(() => {
          const finalLiked =
            direction === "right" ? [...likedIds, track.id] : likedIds;
          onComplete(finalLiked);
        }, 400);
      }
    },
    [currentIndex, tracks, likedIds, onComplete]
  );

  const progress = Math.min(currentIndex, tracks.length);

  return (
    <div className="flex flex-col items-center w-full min-h-0 flex-1">
      {/* Progress bar */}
      <div className="w-full max-w-xl mb-3 px-2 shrink-0">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{progress} / {tracks.length}</span>
          <span>{likedIds.length} liked</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-spotify-lightgray rounded-full h-2">
          <div
            className="bg-spotify-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / tracks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-xl flex-1 min-h-0">
        <AnimatePresence>
          {tracks.map((track, index) => {
            if (index < currentIndex || index > currentIndex + 1) return null;
            return (
              <SwipeCard
                key={track.id}
                track={track}
                onSwipe={handleSwipe}
                isTop={index === currentIndex}
              />
            );
          })}
        </AnimatePresence>

        {currentIndex >= tracks.length && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <svg className="w-16 h-16 mx-auto animate-spin text-spotify-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-lg">Generating your playlist...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons
        onDislike={() => handleSwipe("left")}
        onLike={() => handleSwipe("right")}
        disabled={currentIndex >= tracks.length}
      />
    </div>
  );
}
