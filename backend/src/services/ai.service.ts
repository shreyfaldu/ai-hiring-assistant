import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

type AIRequest = Record<string, unknown>;

function buildPrompt(payload: AIRequest): string {
  return `You are an intelligent AI Hiring Assistant.\n\nINPUT TYPE:\n${payload.task_type ?? ""}\n\nJob Details:\n\n* Title: ${payload.job_title ?? ""}\n* Experience: ${payload.experience ?? ""}\n* Skills: ${payload.skills ?? ""}\n* Location: ${payload.location ?? ""}\n* Salary: ${payload.salary ?? ""}\n* Job Type: ${payload.job_type ?? ""}\n\nJob Description:\n${payload.job_description ?? ""}\n\nCandidate Details:\n\n* Name: ${payload.candidate_name ?? ""}\n* Skills: ${payload.candidate_skills ?? ""}\n* Experience: ${payload.candidate_experience ?? ""}\n* Education: ${payload.candidate_education ?? ""}\n\nResume Text:\n${payload.resume_text ?? ""}\n\n---\n\nTASK LOGIC:\n\nIf task_type = \"generate_jd\":\n\n* Generate Job Description with:\n\n  * Summary\n  * Responsibilities\n  * Skills\n  * Nice-to-have\n\nIf task_type = \"parse_resume\":\nReturn STRICT JSON:\n{\n\"name\": \"\",\n\"email\": \"\",\n\"phone\": \"\",\n\"skills\": [],\n\"experience\": \"\",\n\"education\": \"\"\n}\n\nIf task_type = \"score_candidate\":\nReturn STRICT JSON:\n{\n\"match_score\": number,\n\"summary\": \"\",\n\"strengths\": [],\n\"gaps\": []\n}\n\nIf task_type = \"linkedin_post\":\n\n* Generate short LinkedIn post (<150 words)\n\nIMPORTANT:\n\n* Return only JSON when required\n* Keep responses clean and structured`;
}

function safeParseJson(raw: string) {
  const clean = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

export async function processAI(payload: AIRequest) {
  const prompt = buildPrompt(payload);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (payload.task_type === "parse_resume" || payload.task_type === "score_candidate") {
    const parsed = safeParseJson(text);
    if (!parsed) {
      throw new Error("Gemini did not return valid JSON");
    }
    return parsed;
  }

  return { text };
}
