"use client";

import { motion } from "framer-motion";
import { TriviaAnswer } from "@/types";

interface Props {
  answers: TriviaAnswer[];
  playlistName: string;
  onPlayAgain: () => void;
  onPickNew: () => void;
}

export default function TriviaResults({ answers, playlistName, onPlayAgain, onPickNew }: Props) {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const percentage = Math.round((correct / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score!";
    if (percentage >= 80) return "Amazing!";
    if (percentage >= 60) return "Nice job!";
    if (percentage >= 40) return "Not bad!";
    return "Better luck next time!";
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">{getMessage()}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          from <span className="font-medium text-gray-700 dark:text-gray-300">{playlistName}</span>
        </p>
        <div className="text-6xl font-bold text-spotify-green mb-1">
          {correct}/{total}
        </div>
        <p className="text-gray-500 dark:text-gray-400">{percentage}% correct</p>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 rounded-full bg-spotify-green text-black font-bold text-sm hover:bg-green-400 transition-colors"
        >
          Play Again
        </button>
        <button
          onClick={onPickNew}
          className="flex-1 py-3 rounded-full bg-gray-200 dark:bg-spotify-lightgray font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          New Playlist
        </button>
      </div>

      {/* Per-question breakdown */}
      <h3 className="font-bold mb-3">Breakdown</h3>
      <div className="space-y-3">
        {answers.map((answer, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              answer.correct
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            <img
              src={answer.question.track.albumArt}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {answer.question.track.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {answer.question.track.artist}
              </p>
              {!answer.correct && (
                <p className="text-xs text-red-400 mt-0.5">
                  You picked: {answer.question.options[answer.selectedIndex]}
                </p>
              )}
            </div>
            <span className="text-lg flex-shrink-0">
              {answer.correct ? "\u2705" : "\u274C"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
