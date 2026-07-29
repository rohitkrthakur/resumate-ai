import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    const hasJD = jobDescription && jobDescription.trim().length > 0;

    const prompt = hasJD
      ? `
You are an expert ATS resume reviewer and recruiter. Compare the following resume against the specific job description provided.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide:
1. A match score out of 100 (how well this resume fits THIS specific job)
2. Top 3 strengths that align with this job
3. Top 3 gaps or improvements needed for THIS job
4. Missing keywords from the job description that should appear in the resume

Respond ONLY in this JSON format, no extra text:
{
  "atsScore": number,
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "missingKeywords": ["...", "...", "..."],
  "hasJobMatch": true
}
`
      : `
You are an expert ATS resume reviewer. Analyze the following resume and provide:
1. An ATS score out of 100
2. Top 3 strengths
3. Top 3 areas to improve
4. Missing keywords for a Full Stack Developer role

Resume:
${resumeText}

Respond ONLY in this JSON format, no extra text:
{
  "atsScore": number,
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "missingKeywords": ["...", "...", "..."],
  "hasJobMatch": false
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}