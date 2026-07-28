"use client";

import { useState } from "react";

interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      if (!res.ok) throw new Error("Failed to analyze resume");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          AI Resume Analyzer
        </h1>

        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg mb-4 text-black"
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {result && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
              ATS Score: {result.atsScore}/100
            </h2>

            <div className="mb-4">
              <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
              <ul className="list-disc list-inside text-gray-700">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-orange-700 mb-2">
                Areas to Improve
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {result.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-700 mb-2">
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}