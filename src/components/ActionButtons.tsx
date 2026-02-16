"use client";

interface ActionButtonsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled: boolean;
}

export default function ActionButtons({ onDislike, onLike, disabled }: ActionButtonsProps) {
  return (
    <div className="flex justify-center gap-6 sm:gap-8 mt-2 sm:mt-6 shrink-0 pb-1 sm:pb-2">
      <button
        onClick={onDislike}
        disabled={disabled}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-spotify-lightgray border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Dislike"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        onClick={onLike}
        disabled={disabled}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-spotify-lightgray border-2 border-spotify-green text-spotify-green flex items-center justify-center hover:bg-spotify-green hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Like"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
}
