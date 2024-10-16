"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import Layout from "@/components/Layout";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface TestData {
  wpm: number;
  accuracy: number;
  detailedErrors: Array<{ char: string; expected: string; position: number }>;
}

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
);

export default function Analysis() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  const generateAIRecommendations = async (data: TestData) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on the following typing test results, provide 3-4 specific recommendations to improve typing skills:
    WPM: ${data.wpm}
    Accuracy: ${data.accuracy}%`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const recommendations = text.split("\n").filter((r) => r.trim() !== "");
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setAiRecommendations(["Unable to generate recommendations. Please try again later."]);
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("typingTestData") || "null");
    if (data) {
      setTestData(data);
      generateAIRecommendations(data);
    } else {
      setAiRecommendations(["No test data found. Please complete a typing test first."]);
    }
  }, []);

  if (!testData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const { wpm, accuracy } = testData;

  const lineData = {
    labels: ["WPM", "Accuracy (%)"],
    datasets: [
      {
        label: "Your Performance",
        data: [wpm, accuracy],
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
      {
        label: "Average Performance",
        data: [40, 95], // Example average values
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Typing Analysis</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
          <div className="h-64">
            <Line data={lineData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI-Powered Recommendations</h2>
          {aiRecommendations.length > 0 ? (
            <div className="space-y-4">
              {aiRecommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5-5h3V5h4v5h3l-5 5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">
                      <strong>Recommendation:</strong> {recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Generating recommendations...</p>
          )}
        </div>

        <div>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300 transform hover:scale-105"
          >
            Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}