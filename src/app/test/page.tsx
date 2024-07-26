"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
);

const themes = {
  light: {
    background: "bg-white",
    text: "text-gray-800",
    button: "bg-blue-600 text-white",
  },
  dark: {
    background: "bg-gray-900",
    text: "text-gray-200",
    button: "bg-gray-700 text-white",
  },
};

const generateRandomSentence = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt =
      "Generate two random sentences that are interesting and varied in topic. The sentences should be connected and form a coherent thought.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/\n/g, " ").trim();
  } catch (error) {
    console.error("Error generating sentence:", error);
    return "An error occurred while generating the sentence. Please try again.";
  }
};

export default function Test() {
  const [theme, setTheme] = useState(themes.light);
  const [sentence, setSentence] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [wpm, setWpm] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [completedWords, setCompletedWords] = useState(0);
  const keyPressAudios = useRef<HTMLAudioElement[]>([]);
  const keyReturnAudio = useRef<HTMLAudioElement | null>(null);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      startTest();
    }
  }, [isCountingDown, countdown]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsStarted(false);
      calculateFinalWpm();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isStarted, timeLeft]);

  useEffect(() => {
    const words = sentence.split(" ");
    const inputWords = input.trim().split(" ");
    let completedWordCount = 0;

    for (let i = 0; i < inputWords.length; i++) {
      if (inputWords[i] === words[i]) {
        completedWordCount++;
      } else {
        break;
      }
    }

    setCompletedWords(completedWordCount);

    if (input.trim() === sentence.trim()) {
      setTotalWords(totalWords + completedWordCount);
      setIsLoading(true);
      generateRandomSentence().then((newSentence) => {
        setSentence(newSentence);
        setIsLoading(false);
      });
      setInput("");
      setCompletedWords(0);
    }
  }, [input, sentence]);

  useEffect(() => {
    keyPressAudios.current = [new Audio("/key1.mp3")];
    keyReturnAudio.current = new Audio("/key-return.mp3");

    // Preload audio files
    keyPressAudios.current.forEach((audio) => audio.load());
    keyReturnAudio.current.load();
  }, []);

  const startCountdown = async () => {
    setIsCountingDown(true);
    setCountdown(3);
    setIsLoading(true);
    const initialSentence = await generateRandomSentence();
    setSentence(initialSentence);
    setIsLoading(false);
  };

  const startTest = () => {
    setIsStarted(true);
    setTimeLeft(60);
    setInput("");
    setWpm(null);
    setTotalWords(0);
    setCompletedWords(0);
    setStartTime(new Date());
  };

  const calculateFinalWpm = () => {
    if (startTime) {
      const timeElapsed = (new Date().getTime() - startTime.getTime()) / 60000;
      const finalWords = totalWords + completedWords;
      setWpm(Math.round(finalWords / timeElapsed));
    }
  };

  const playKeySound = (key: string) => {
    if (key === "Enter" || key === " ") {
      if (keyReturnAudio.current) {
        keyReturnAudio.current.currentTime = 0;
        keyReturnAudio.current.play();
      }
    } else {
      const randomIndex = Math.floor(
        Math.random() * keyPressAudios.current.length
      );
      const audio = keyPressAudios.current[randomIndex];
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isStarted && !isLoading) {
      playKeySound(e.key);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newErrors = value.split("").reduce((acc, char, index) => {
      if (char !== sentence[index]) {
        return acc + 1;
      }
      return acc;
    }, 0);
    setErrors(newErrors);
    setInput(value);
  };

  const renderSentence = () => {
    return sentence.split("").map((char, index) => {
      let className = "transition-colors duration-200 ";
      if (index < input.length) {
        className += char === input[index] ? "text-green-500" : "text-red-500";
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const renderResult = () => {
    if (wpm !== null) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto"
        >
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Test Complete!
          </h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">{wpm} WPM</div>
          <p className="text-xl text-gray-600 mb-6">
            Great job! You've completed the typing test.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className={`py-2 px-4 rounded ${theme.button} text-lg`}
              onClick={startCountdown}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 py-3 px-6 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300 transform hover:scale-105"
            >
              Home
            </Link>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className={`${theme.background} min-h-screen flex flex-col`}>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <button
          onClick={() => setTheme(theme === themes.light ? themes.dark : themes.light)}
          className={`py-2 px-4 rounded ${theme.button} text-lg mb-4`}
        >
          Toggle Theme
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8"
        >
          <AnimatePresence>
            {isCountingDown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center text-7xl font-bold text-blue-600 mb-8"
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>
          {!isStarted && !isCountingDown ? (
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Ready to Test Your Typing Speed?
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                Challenge yourself and improve your typing skills!
              </p>
              <button
                className={`py-2 px-8 rounded ${theme.button} text-xl font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105`}
                onClick={startCountdown}
              >
                Start Typing Test
              </button>
            </div>
          ) : (
            isStarted && (
              <>
                <div className="mb-6 text-xl font-mono bg-gray-100 p-6 rounded-lg leading-relaxed">
                  {isLoading ? (
                    <div className="text-center">Loading new sentence...</div>
                  ) : (
                    renderSentence()
                  )}
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="border-2 border-blue-300 p-4 w-full rounded-lg mb-6 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Start typing..."
                  disabled={!isStarted || isLoading}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Words: {totalWords}
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    Accuracy:{" "}
                    {Math.max(0, 100 - (errors / input.length) * 100).toFixed(
                      2
                    )}
                    %
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    Time Left: {timeLeft}s
                  </div>
                </div>
              </>
            )
          )}
          {renderResult()}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
