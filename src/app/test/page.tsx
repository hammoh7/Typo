"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const generateRandomSentence = () => {
  return 'The quick brown fox jumps over the lazy dog.';
};

export default function Test() {
  const [sentence, setSentence] = useState(generateRandomSentence());
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [wpm, setWpm] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsStarted(false);
      calculateWpm();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isStarted, timeLeft]);

  const startTest = () => {
    setIsStarted(true);
    setTimeLeft(60);
    setSentence(generateRandomSentence());
    setInput('');
    setWpm(null);
    setStartTime(new Date());
  };

  const calculateWpm = () => {
    const wordsTyped = input.trim().split(' ').length;
    setWpm(wordsTyped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startTime) {
      setStartTime(new Date());
    }
    setInput(e.target.value);
    
    if (e.target.value.endsWith(' ')) {
      const wordsTyped = e.target.value.trim().split(' ').length;
      
      if (startTime) {
        const timeElapsed = (new Date().getTime() - startTime.getTime()) / 60000;
        setWpm(Math.round(wordsTyped / timeElapsed));
      }
    }
  };
  

  const renderSentence = () => {
    const inputLength = input.length;
    return sentence.split('').map((char, index) => {
      let className = '';
      if (index < inputLength) {
        className = char === input[index] ? 'text-green-500' : 'text-red-500';
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
        <div className="text-center">
          <h2 className="text-4xl mb-4">Your WPM: {wpm}</h2>
          <button className="bg-blue-600 text-white py-2 px-4 rounded" onClick={startTest}>
            Try Again
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center">
        {!isStarted ? (
          <button className="bg-blue-600 text-white py-2 px-4 rounded mb-4" onClick={startTest}>
            Start Typing
          </button>
        ) : (
          <>
            <div className="mb-4 text-lg">{renderSentence()}</div>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              className="border p-2 w-full max-w-lg mb-4"
              placeholder="Start typing..."
              disabled={!isStarted}
            />
            <div className="text-right text-lg mb-4">Time Left: {timeLeft}s</div>
          </>
        )}
        {renderResult()}
      </main>
      <Footer />
    </div>
  );
}
