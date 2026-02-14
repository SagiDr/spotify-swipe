"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PlaylistResult from "@/components/PlaylistResult";

function ResultContent() {
  const searchParams = useSearchParams();

  const url = searchParams.get("url");
  const name = searchParams.get("name");
  const count = searchParams.get("count");
  const error = searchParams.get("error");

  if (error === "no_likes") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">
            No songs liked!
          </h2>
          <p className="text-gray-400 mb-6">
            You need to like at least one song for us to generate recommendations.
          </p>
          <a
            href="/swipe"
            className="inline-block px-8 py-4 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full text-lg transition-colors"
          >
            Try Again
          </a>
        </div>
      </main>
    );
  }

  if (!url || !name || !count) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-400 mb-6">No playlist data found.</p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-spotify-green hover:bg-green-400 text-black font-bold rounded-full text-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <PlaylistResult
        playlistUrl={url}
        playlistName={name}
        trackCount={parseInt(count, 10)}
      />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
