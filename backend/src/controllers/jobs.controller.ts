import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool, useDemo, mockJobs } from "../config/db.js";

const defaultSteps = [
  "Create Job",
  "JD Review",
  "Publish Job",
  "Applications",
  "Shortlist Candidates",
  "Finalize"
];

export async function createJob(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { job_title, experience, skills, location, salary, job_type, job_description } = req.body;

  if (useDemo) {
    // Demo mode: create mock job
    const jobId = uuidv4();
    const publicUrl = `${req.protocol}://${req.get("host")?.replace("8000", "3000")}/jobs/${jobId}`;
    
    mockJobs.set(jobId, {
      id: jobId,
      hr_id: userId,
      title: job_title,
      experience,
      skills,
      location,
      salary,
      job_type,
      job_description,
      public_url: publicUrl,
      created_at: new Date()
    });

    return res.status(201).json({
      job: {
        id: jobId,
        title: job_title,
        job_description,
        public_url: publicUrl
      }
    });
  }

  const inserted = await pool.query(
    `INSERT INTO jobs (hr_id, title, experience, skills, location, salary, job_type, job_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, job_description`,
    [userId, job_title, experience, skills, location, salary, job_type, job_description]
  );

  const job = inserted.rows[0];

  for (let index = 0; index < defaultSteps.length; index += 1) {
    await pool.query(
      `INSERT INTO job_steps (job_id, step_name, step_order, status)
       VALUES ($1, $2, $3, $4)`,
      [job.id, defaultSteps[index], index + 1, index === 0 ? "active" : "pending"]
    );
  }

  const publicUrl = `${req.protocol}://${req.get("host")?.replace("8000", "3000")}/jobs/${job.id}`;

  await pool.query("UPDATE jobs SET public_url = $1 WHERE id = $2", [publicUrl, job.id]);

  return res.status(201).json({
    job: {
      id: job.id,
      title: job.title,
      job_description: job.job_description,
      public_url: publicUrl
    }
  });
}

export async function getJobById(req: Request, res: Response) {
  const { id } = req.params;

  if (useDemo) {
    const job = mockJobs.get(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json({ job });
  }

  const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Job not found" });
  }

  return res.json({ job: result.rows[0] });
}
