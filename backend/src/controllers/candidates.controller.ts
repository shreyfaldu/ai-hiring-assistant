import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool, useDemo, mockCandidates, mockJobs, mockScores } from "../config/db.js";
import { processAI } from "../services/ai.service.js";
import { extractResumeText } from "../services/resume.service.js";
import { uploadResume } from "../services/s3.service.js";

export async function applyToJob(req: Request, res: Response) {
  const { id: jobId } = req.params;
  const { name, email, phone } = req.body;
  const file = req.file;

  if (!name || !email || !phone || !file) {
    return res.status(400).json({ message: "Name, email, phone, and resume are required" });
  }

  if (useDemo) {
    // Demo mode: create mock candidate
    const candidateId = uuidv4();
    const resumeText = await extractResumeText(file);
    
    let parsedData = {};
    try {
      parsedData = await processAI({
        task_type: "parse_resume",
        resume_text: resumeText,
        candidate_name: name
      });
    } catch (err) {
      console.log("[DEMO MODE] Resume parsing failed, using empty data:", err);
    }

    const candidate = {
      id: candidateId,
      job_id: jobId,
      name,
      email,
      phone,
      resume_url: `demo://resume/${candidateId}`,
      resume_text: resumeText,
      parsed_data: parsedData,
      created_at: new Date()
    };

    // Store by job_id for easy retrieval
    if (!mockCandidates.has(jobId)) {
      mockCandidates.set(jobId, []);
    }
    mockCandidates.get(jobId).push(candidate);

    return res.status(201).json({ 
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resume_url: candidate.resume_url,
        parsed_data: candidate.parsed_data
      }
    });
  }

  const key = `resumes/${jobId}/${Date.now()}-${file.originalname}`;
  const resumeUrl = await uploadResume(file.buffer, key, file.mimetype);
  const resumeText = await extractResumeText(file);

  const parsedData = await processAI({
    task_type: "parse_resume",
    resume_text: resumeText,
    candidate_name: name
  });

  const result = await pool.query(
    `INSERT INTO candidates (id, job_id, name, email, phone, resume_url, resume_text, parsed_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, email, phone, resume_url, parsed_data`,
    [uuidv4(), jobId, name, email, phone, resumeUrl, resumeText, parsedData]
  );

  return res.status(201).json({ candidate: result.rows[0] });
}

export async function getJobCandidates(req: Request, res: Response) {
  const { id: jobId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (useDemo) {
    // Demo mode: check if job belongs to user and return mock candidates
    const job = mockJobs.get(jobId);
    if (!job || job.hr_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const candidates = mockCandidates.get(jobId) || [];
    return res.json({
      candidates: candidates.map((candidate: any) => {
        const score = mockScores.get(candidate.id);
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          resume_url: candidate.resume_url,
          parsed_data: candidate.parsed_data,
          score: score ? { match_score: score.match_score, summary: score.summary } : undefined
        };
      }).sort((a: any, b: any) => (b.score?.match_score || 0) - (a.score?.match_score || 0))
    });
  }

  const owner = await pool.query("SELECT id FROM jobs WHERE id = $1 AND hr_id = $2", [jobId, userId]);
  if (owner.rows.length === 0) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const candidates = await pool.query(
    `SELECT c.*, cs.match_score, cs.summary
     FROM candidates c
     LEFT JOIN candidate_scores cs ON cs.candidate_id = c.id
     WHERE c.job_id = $1
     ORDER BY COALESCE(cs.match_score, 0) DESC, c.created_at DESC`,
    [jobId]
  );

  return res.json({
    candidates: candidates.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      resume_url: row.resume_url,
      parsed_data: row.parsed_data,
      score: row.match_score
        ? {
            match_score: row.match_score,
            summary: row.summary
          }
        : undefined
    }))
  });
}

export async function scoreCandidate(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id: candidateId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (useDemo) {
    // Demo mode: find candidate in mock data and score it
    let candidate: any = null;
    let jobId: string | null = null;

    // Find candidate and job
    for (const [jId, candidateList] of mockCandidates.entries()) {
      const found = (candidateList as any[]).find((c: any) => c.id === candidateId);
      if (found) {
        candidate = found;
        jobId = jId;
        break;
      }
    }

    if (!candidate || !jobId) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const job = mockJobs.get(jobId);
    if (!job || job.hr_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const parsed = candidate.parsed_data || {};

    let score;
    try {
      score = await processAI({
        task_type: "score_candidate",
        job_title: job.title,
        experience: job.experience,
        skills: job.skills,
        location: job.location,
        salary: job.salary,
        job_type: job.job_type,
        job_description: job.job_description,
        candidate_name: candidate.name,
        candidate_skills: Array.isArray(parsed.skills) ? parsed.skills.join(", ") : "",
        candidate_experience: parsed.experience || "",
        candidate_education: parsed.education || "",
        resume_text: candidate.resume_text
      });
    } catch (err) {
      console.log("[DEMO MODE] Scoring failed:", err);
      score = { match_score: 75, summary: "Demo mode score", strengths: [], gaps: [] };
    }

    const matchScore = Number(score.match_score || 0);
    const summary = String(score.summary || "");
    const strengths = Array.isArray(score.strengths) ? score.strengths : [];
    const gaps = Array.isArray(score.gaps) ? score.gaps : [];

    mockScores.set(candidateId, { match_score: matchScore, summary, strengths, gaps });

    return res.json({
      score: {
        candidate_id: candidateId,
        match_score: matchScore,
        summary,
        strengths: JSON.stringify(strengths),
        gaps: JSON.stringify(gaps)
      }
    });
  }

  const data = await pool.query(
    `SELECT c.*, j.title, j.experience AS job_experience, j.skills AS job_skills, j.location, j.salary, j.job_type, j.job_description
     FROM candidates c
     JOIN jobs j ON j.id = c.job_id
     WHERE c.id = $1 AND j.hr_id = $2`,
    [candidateId, userId]
  );

  if (data.rows.length === 0) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const candidate = data.rows[0];
  const parsed = candidate.parsed_data || {};

  const score = await processAI({
    task_type: "score_candidate",
    job_title: candidate.title,
    experience: candidate.job_experience,
    skills: candidate.job_skills,
    location: candidate.location,
    salary: candidate.salary,
    job_type: candidate.job_type,
    job_description: candidate.job_description,
    candidate_name: candidate.name,
    candidate_skills: Array.isArray(parsed.skills) ? parsed.skills.join(", ") : "",
    candidate_experience: parsed.experience || "",
    candidate_education: parsed.education || "",
    resume_text: candidate.resume_text
  });

  const matchScore = Number(score.match_score || 0);
  const summary = String(score.summary || "");
  const strengths = Array.isArray(score.strengths) ? score.strengths : [];
  const gaps = Array.isArray(score.gaps) ? score.gaps : [];

  const upsert = await pool.query(
    `INSERT INTO candidate_scores (candidate_id, match_score, summary, strengths, gaps)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (candidate_id)
     DO UPDATE SET
      match_score = EXCLUDED.match_score,
      summary = EXCLUDED.summary,
      strengths = EXCLUDED.strengths,
      gaps = EXCLUDED.gaps,
      updated_at = NOW()
     RETURNING candidate_id, match_score, summary, strengths, gaps`,
    [candidateId, matchScore, summary, JSON.stringify(strengths), JSON.stringify(gaps)]
  );

  return res.json({ score: upsert.rows[0] });
}
