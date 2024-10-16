"use client";

import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  LineElement,
  BarElement
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
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  const getMostCommonErrors = (errors: TestData["detailedErrors"]) => {
    const errorCount = errors.reduce(
      (acc: { [key: string]: number }, error) => {
        acc[error.expected] = (acc[error.expected] || 0) + 1;
        return acc;
      },
      {}
    );
    return Object.entries(errorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([char, count]) => ({ char, count }));
  };

  const generateAIRecommendations = async (data: TestData) => {
    setAiError(null);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on the following typing test results, provide 3-4 specific recommendations to improve typing skills:
    WPM: ${data.wpm}
    Accuracy: ${data.accuracy}%
    Most common errors: ${JSON.stringify(
      getMostCommonErrors(data.detailedErrors)
    )}
    Provide concise, actionable advice.`;

    console.log("Sending prompt to AI:", prompt); // Log the prompt

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const recommendations = text.split("\n").filter((r) => r.trim() !== "");
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setAiError("Unable to generate AI recommendations. Please try again later.");
      setAiRecommendations([]);
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("typingTestData") || "null");
    console.log("Loaded test data:", data); // Log the loaded data
    setTestData(data);

    if (data) {
      generateAIRecommendations(data);
    }
  }, []);

  if (!testData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const { wpm, accuracy, detailedErrors } = testData;

  const commonErrors = getMostCommonErrors(detailedErrors);

  const barData = {
    labels: commonErrors.map((e) => e.char),
    datasets: [
      {
        label: "Error Count",
        data: commonErrors.map((e) => e.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="h-64">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Most Common Errors</h2>
            {commonErrors.length > 0 ? (
              <div className="h-64">
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            ) : (
              <p className="text-gray-600">No common errors to display.</p>
            )}
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-full text-lg font-semibold hover:bg-gray-300 transition duration-300 transform hover:scale-105"
          >
            Home
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI-Powered Recommendations</h2>
          {aiError ? (
            <p className="text-red-500">{aiError}</p>
          ) : aiRecommendations.length > 0 ? (
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
                      <strong>{recommendation.split(":")[0]}:</strong>{" "}
                      {recommendation.split(":").slice(1).join(":").trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Generating recommendations...</p>
          )}
        </div>
      </div>
    </Layout>
  );
}