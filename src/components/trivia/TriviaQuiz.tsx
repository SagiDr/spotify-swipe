"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { TriviaQuestion, TriviaAnswer } from "@/types";

interface Props {
  questions: TriviaQuestion[];
  onFinish: (answers: TriviaAnswer[]) => void;
}

export default function TriviaQuiz({ questions, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<TriviaAnswer[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const question = questions[currentIndex];

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playClip = useCallback(() => {
    stopAudio();
    if (!question.track.previewUrl) return;

    const audio = new Audio(question.track.previewUrl);
    audio.volume = volume;
    audioRef.current = audio;

    // Random start offset in the 30s preview (leave room for 3s clip)
    const startOffset = Math.random() * 27;

    audio.currentTime = startOffset;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });

    // Stop after 3 seconds
    setTimeout(() => {
      if (audioRef.current === audio) {
        audio.pause();
        setIsPlaying(false);
      }
    }, 3000);

    audio.onended = () => {
      setIsPlaying(false);
    };
  }, [question, stopAudio, volume]);

  // Auto-play clip when question changes
  useEffect(() => {
    playClip();
    return () => stopAudio();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preload next question's audio
  useEffect(() => {
    const next = questions[currentIndex + 1];
    if (next?.track.previewUrl) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "fetch";
      link.href = next.track.previewUrl;
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }
  }, [currentIndex, questions]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);

    const answer: TriviaAnswer = {
      question,
      selectedIndex: index,
      correct: index === question.correctIndex,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Move to next question or finish after a short delay
    setTimeout(() => {
      stopAudio();
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedIndex(null);
      } else {
        onFinish(newAnswers);
      }
    }, 1500);
  };

  const getButtonStyle = (index: number) => {
    if (selectedIndex === null) {
      return "bg-gray-100 dark:bg-spotify-lightgray hover:bg-gray-200 dark:hover:bg-gray-600";
    }
    if (index === question.correctIndex) {
      return "bg-green-500/20 border-green-500 text-green-400";
    }
    if (index === selectedIndex && index !== question.correctIndex) {
      return "bg-red-500/20 border-red-500 text-red-400";
    }
    return "bg-gray-100 dark:bg-spotify-lightgray opacity-50";
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 flex flex-col items-center">
      {/* Progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {currentIndex + 1} / {questions.length}</span>
          <span>{answers.filter((a) => a.correct).length} correct</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-spotify-green rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Album art (blurred until answered) */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden mb-6 relative"
      >
        {question.track.albumArt ? (
          <img
            src={question.track.albumArt}
            alt="Album art"
            className={`w-full h-full object-cover transition-all duration-500 ${
              selectedIndex === null ? "blur-xl scale-110" : "blur-0 scale-100"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        {selectedIndex === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">?</span>
          </div>
        )}
      </motion.div>

      {/* Song info (shown after answering) */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <p className="font-bold">{question.track.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{question.track.artist}</p>
        </motion.div>
      )}

      {/* Replay button + Volume */}
      {selectedIndex === null && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={playClip}
            disabled={isPlaying}
            className="px-4 py-2 rounded-full bg-spotify-green text-black font-medium text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
          >
            {isPlaying ? "Playing..." : "Replay Clip"}
          </button>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              {volume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-spotify-green bg-gray-300 dark:bg-gray-600"
            />
          </div>
        </div>
      )}

      {/* Answer options */}
      <div className="w-full grid grid-cols-1 gap-2">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleAnswer(index)}
            disabled={selectedIndex !== null}
            className={`w-full p-3 rounded-xl border border-transparent text-left text-sm font-medium transition-all ${getButtonStyle(index)}`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
