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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to extract PDF text");

      const data = await res.json();
      setResumeText(data.text);
    } catch (err) {
      setError("Could not read this PDF. Try pasting the text instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Upload a resume or paste text to begin the scan.");
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
      setError("The scan failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    result && result.atsScore >= 75
      ? "#5EEAD4"
      : result && result.atsScore >= 50
      ? "#F5A623"
      : "#F87171";

  const circumference = 2 * Math.PI * 54;
  const offset = result
    ? circumference - (result.atsScore / 100) * circumference
    : circumference;

  return (
    <main className="min-h-screen bg-[#0B0E14] text-[#E6E9EF] font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-[#8B93A7] uppercase">
              ATS Scanner v1.0
            </span>
          </div>
          <h1 className="font-mono text-3xl md:text-4xl font-semibold text-white tracking-tight">
            resumate<span className="text-[#5EEAD4]">.ai</span>
          </h1>
          <p className="text-[#8B93A7] mt-2 text-sm">
            Upload your resume. Get scored the way applicant tracking systems see it.
          </p>
        </div>

        {/* Upload / Input panel — styled like a code editor */}
        <div className="rounded-lg border border-[#1E2430] bg-[#12161F] overflow-hidden mb-6">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1E2430] bg-[#0E1219]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#5EEAD4]/60" />
            <span className="ml-3 font-mono text-xs text-[#8B93A7]">
              {fileName || "resume.txt"}
            </span>
          </div>

          <div className="p-4">
            <label className="flex items-center justify-center gap-2 border border-dashed border-[#2A3140] rounded-md py-4 cursor-pointer hover:border-[#5EEAD4]/50 hover:bg-[#5EEAD4]/[0.03] transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="font-mono text-sm text-[#8B93A7]">
                {uploading ? "extracting text..." : "drop PDF or click to upload"}
              </span>
            </label>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#1E2430]" />
              <span className="font-mono text-xs text-[#4A5265]">or paste raw text</span>
              <div className="flex-1 h-px bg-[#1E2430]" />
            </div>

            <textarea
              className="w-full h-48 bg-transparent border border-[#1E2430] rounded-md p-3 text-sm font-mono text-[#E6E9EF] placeholder:text-[#4A5265] focus:outline-none focus:border-[#5EEAD4]/50 resize-none"
              placeholder="paste resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || uploading}
          className="w-full font-mono text-sm font-medium bg-[#5EEAD4] text-[#0B0E14] px-6 py-3.5 rounded-md hover:bg-[#7FF3E2] disabled:bg-[#2A3140] disabled:text-[#4A5265] transition-colors"
        >
          {loading ? "scanning..." : "run scan →"}
        </button>

        {error && (
          <p className="font-mono text-xs text-[#F87171] mt-3">✕ {error}</p>
        )}

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6 animate-[fadeIn_0.4s_ease-out]">
            {/* Score gauge */}
            <div className="flex items-center gap-6 p-6 rounded-lg border border-[#1E2430] bg-[#12161F]">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#1E2430"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold text-white">
                    {result.atsScore}
                  </span>
                  <span className="font-mono text-[10px] text-[#8B93A7]">/ 100</span>
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#8B93A7] mb-1">
                  ATS Compatibility
                </p>
                <p className="text-sm text-[#E6E9EF]">
                  {result.atsScore >= 75
                    ? "Strong match. Minor refinements suggested below."
                    : result.atsScore >= 50
                    ? "Moderate match. Several gaps to close."
                    : "Weak match. Significant revisions recommended."}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div className="p-5 rounded-lg border border-[#1E2430] bg-[#12161F]">
              <p className="font-mono text-xs uppercase tracking-widest text-[#5EEAD4] mb-3">
                ✓ Strengths
              </p>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[#C4CAD6] flex gap-2">
                    <span className="text-[#5EEAD4] font-mono">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-5 rounded-lg border border-[#1E2430] bg-[#12161F]">
              <p className="font-mono text-xs uppercase tracking-widest text-[#F5A623] mb-3">
                ! Improve
              </p>
              <ul className="space-y-2">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-[#C4CAD6] flex gap-2">
                    <span className="text-[#F5A623] font-mono">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing keywords */}
            <div className="p-5 rounded-lg border border-[#1E2430] bg-[#12161F]">
              <p className="font-mono text-xs uppercase tracking-widest text-[#8B93A7] mb-3">
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs px-2.5 py-1 rounded border border-[#2A3140] text-[#8B93A7] bg-[#0E1219]"
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