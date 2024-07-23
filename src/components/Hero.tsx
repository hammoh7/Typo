"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HomeContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-3xl bg-white rounded-3xl shadow-2xl p-12"
    >
      <h1 className="text-5xl font-bold mb-6 text-gray-800">Welcome to Typo</h1>
      <p className="text-xl mb-8 text-gray-600 leading-relaxed">
        Challenge yourself and improve your typing skills with our advanced
        typing test platform. Measure your speed, accuracy, and progress over
        time.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          href="/test"
          className="bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Start Typing Test
        </Link>
        <Link
          href="/leaderboard"
          className="bg-gray-200 text-gray-800 py-3 px-8 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300 transform hover:scale-105"
        >
          View Leaderboard
        </Link>
      </div>
    </motion.div>
  );
};

export default HomeContent;
