"use client";

import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
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

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
);

export default function Analysis() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("typingTestData") || "null");
    setTestData(data);

    if (data) {
      generateAIRecommendations(data);
    }
  }, []);

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

    console.log("Sending prompt to AI:", prompt);

    try {
      const result = await model.generateContent(prompt);
      console.log("AI response received:", result);
      const response = await result.response;
      const text = response.text();
      console.log("AI text response:", text);
      const recommendations = text.split("\n").filter((r) => r.trim() !== "");
      console.log("Parsed recommendations:", recommendations);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setAiError(
        "Unable to generate AI recommendations. Please try again later."
      );
      setAiRecommendations([]);
    }
  };

  if (!testData)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  const { wpm, accuracy, detailedErrors } = testData;

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

  const commonErrors = getMostCommonErrors(detailedErrors);

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

  const doughnutData = {
    labels: commonErrors.map((e) => e.char),
    datasets: [
      {
        data: commonErrors.map((e) => e.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Typing Analysis
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="h-64">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Most Common Errors</h2>
            <div className="h-64">
              <Doughnut
                data={doughnutData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            AI-Powered Recommendations  
          </h2>
          {aiError ? (
            <p className="text-red-500">{aiError}</p>
          ) : aiRecommendations.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {aiRecommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">
                  {recommendation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Generating recommendations...</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
