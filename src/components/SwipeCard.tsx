"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";
import { Track } from "@/types";
import AudioPlayer from "./AudioPlayer";

interface SwipeCardProps {
  track: Track;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export default function SwipeCard({ track, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      <div className="bg-white dark:bg-spotify-lightgray border border-gray-200 dark:border-transparent rounded-3xl overflow-hidden shadow-2xl mx-auto h-full flex flex-col">
        {/* Album art */}
        <div className="relative w-full flex-1 min-h-0">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={`${track.name} album art`}
              fill
              className="object-cover"
              sizes="(max-width: 576px) 100vw, 576px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="#9CA3AF">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}

          {/* LIKE overlay */}
          {isTop && (
            <motion.div
              className="absolute top-8 left-8 border-4 border-spotify-green text-spotify-green text-5xl font-bold px-6 py-2 rounded-xl rotate-[-15deg] bg-black/30 backdrop-blur-sm"
              style={{ opacity: likeOpacity }}
            >
              LIKE
            </motion.div>
          )}

          {/* NOPE overlay */}
          {isTop && (
            <motion.div
              className="absolute top-8 right-8 border-4 border-red-500 text-red-500 text-5xl font-bold px-6 py-2 rounded-xl rotate-[15deg] bg-black/30 backdrop-blur-sm"
              style={{ opacity: nopeOpacity }}
            >
              NOPE
            </motion.div>
          )}
        </div>

        {/* Song info */}
        <div className="px-5 py-3 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
            {track.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-base leading-snug line-clamp-1">
            {track.artist}
          </p>
          <AudioPlayer previewUrl={track.previewUrl} spotifyUrl={track.spotifyUrl} trackId={track.id} />
        </div>
      </div>
    </motion.div>
  );
}
