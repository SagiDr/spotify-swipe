"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlaylistSummary, Track, TriviaQuestion, TriviaAnswer } from "@/types";
import PlaylistSelector from "@/components/trivia/PlaylistSelector";
import TriviaQuiz from "@/components/trivia/TriviaQuiz";
import TriviaResults from "@/components/trivia/TriviaResults";

type Phase = "select" | "quiz" | "results";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(tracks: Track[], count: number): TriviaQuestion[] {
  const withPreview = tracks.filter((t) => t.previewUrl);
  const selected = shuffle(withPreview).slice(0, count);

  return selected.map((track) => {
    // Pick 3 wrong options from other tracks in the playlist
    const others = tracks
      .filter((t) => t.id !== track.id)
      .map((t) => t.name);
    const wrongOptions = shuffle(others).slice(0, 3);

    const options = shuffle([track.name, ...wrongOptions]);
    const correctIndex = options.indexOf(track.name);

    return { track, options, correctIndex };
  });
}

export default function TriviaPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistSummary | null>(null);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [answers, setAnswers] = useState<TriviaAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

  // Fetch playlists
  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("/api/trivia/playlists");
        if (res.status === 401) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setPlaylists(data.playlists ?? []);
      } catch {
        setError("Failed to load playlists");
      } finally {
        setLoadingPlaylists(false);
      }
    }
    fetchPlaylists();
  }, [router]);

  const startQuiz = useCallback(async (playlist: PlaylistSummary, cachedTracks?: Track[]) => {
    setSelectedPlaylist(playlist);
    setLoadingTracks(true);
    setError(null);

    try {
      let tracks: Track[];
      if (cachedTracks) {
        tracks = cachedTracks;
      } else {
        const res = await fetch(`/api/trivia/tracks?playlistId=${playlist.id}`);
        if (!res.ok) throw new Error("Failed to fetch tracks");
        const data = await res.json();
        tracks = data.tracks ?? [];
        setAllTracks(tracks);
      }

      const withPreview = tracks.filter((t) => t.previewUrl);
      if (withPreview.length < 4) {
        setError(
          `This playlist only has ${withPreview.length} songs with previews. Please pick a playlist with at least 4 previewable songs.`
        );
        setPhase("select");
        setLoadingTracks(false);
        return;
      }

      const q = generateQuestions(tracks, Math.min(10, withPreview.length));
      setQuestions(q);
      setAnswers([]);
      setPhase("quiz");
    } catch {
      setError("Failed to load tracks. Try another playlist.");
      setPhase("select");
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  const handleFinish = (ans: TriviaAnswer[]) => {
    setAnswers(ans);
    setPhase("results");
  };

  const handlePlayAgain = () => {
    if (selectedPlaylist && allTracks.length > 0) {
      startQuiz(selectedPlaylist, allTracks);
    }
  };

  const handlePickNew = () => {
    setPhase("select");
    setSelectedPlaylist(null);
    setAllTracks([]);
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-16 pb-8 overflow-y-auto" style={{ height: "100vh" }}>
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 p-1.5 sm:p-2 rounded-full bg-gray-200 dark:bg-spotify-lightgray text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Back to home"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Music Trivia
      </motion.h1>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 mx-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center max-w-md"
        >
          {error}
        </motion.div>
      )}

      {/* Loading tracks overlay */}
      {loadingTracks && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading tracks...</p>
          </div>
        </div>
      )}

      {/* Phases */}
      {!loadingTracks && phase === "select" && (
        <PlaylistSelector
          playlists={playlists}
          onSelect={startQuiz}
          loading={loadingPlaylists}
        />
      )}

      {!loadingTracks && phase === "quiz" && questions.length > 0 && (
        <TriviaQuiz questions={questions} onFinish={handleFinish} />
      )}

      {phase === "results" && selectedPlaylist && (
        <TriviaResults
          answers={answers}
          playlistName={selectedPlaylist.name}
          onPlayAgain={handlePlayAgain}
          onPickNew={handlePickNew}
        />
      )}
    </main>
  );
}
