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
      posted: false,
      created_at: new Date()
    });

    return res.status(201).json({
      job: {
        id: jobId,
        title: job_title,
        experience,
        skills,
        location,
        salary,
        job_type,
        job_description,
        public_url: publicUrl
      }
    });
  }

  const inserted = await pool.query(
    `INSERT INTO jobs (hr_id, title, experience, skills, location, salary, job_type, job_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, experience, skills, location, salary, job_type, job_description`,
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

  // JD is already generated: Create + JD review complete; focus on Publish.
  await pool.query(
    `UPDATE job_steps SET status = 'completed' WHERE job_id = $1 AND step_order IN (1, 2)`,
    [job.id]
  );
  await pool.query(
    `UPDATE job_steps SET status = 'active' WHERE job_id = $1 AND step_order = 3`,
    [job.id]
  );

  const publicUrl = `${req.protocol}://${req.get("host")?.replace("8000", "3000")}/jobs/${job.id}`;

  await pool.query("UPDATE jobs SET public_url = $1 WHERE id = $2", [publicUrl, job.id]);

  return res.status(201).json({
    job: {
      id: job.id,
      title: job.title,
      experience: job.experience,
      skills: job.skills,
      location: job.location,
      salary: job.salary,
      job_type: job.job_type,
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

export async function getJobResume(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (useDemo) {
    const job = mockJobs.get(id);
    if (!job || job.hr_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const posted = Boolean((job as { posted?: boolean }).posted);
    const active_pipeline_index = posted ? 3 : 2;
    return res.json({
      job: {
        id: job.id,
        title: job.title,
        experience: job.experience,
        skills: job.skills,
        location: job.location,
        salary: job.salary,
        job_type: job.job_type,
        job_description: job.job_description,
        public_url: job.public_url,
        posted,
        active_pipeline_index
      }
    });
  }

  const result = await pool.query(
    `SELECT id, title, experience, skills, location, salary, job_type, job_description, public_url, posted
     FROM jobs WHERE id = $1 AND hr_id = $2`,
    [id, userId]
  );
  if (result.rows.length === 0) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const row = result.rows[0] as {
    id: string;
    title: string;
    posted: boolean;
    job_description: string;
  };

  const stepRes = await pool.query(
    `SELECT step_order FROM job_steps WHERE job_id = $1 AND status = 'active' ORDER BY step_order LIMIT 1`,
    [id]
  );

  let active_pipeline_index = 0;
  if (stepRes.rows[0]) {
    active_pipeline_index = Math.min(5, Math.max(0, Number(stepRes.rows[0].step_order) - 1));
  } else {
    const done = await pool.query(
      `SELECT COUNT(*)::int AS c FROM job_steps WHERE job_id = $1 AND status = 'completed'`,
      [id]
    );
    if ((done.rows[0]?.c ?? 0) >= 6) {
      active_pipeline_index = 5;
    }
  }

  if (row.posted && active_pipeline_index < 3) {
    active_pipeline_index = 3;
  }
  if (!row.posted && row.job_description && active_pipeline_index < 2) {
    active_pipeline_index = 2;
  }

  return res.json({
    job: {
      ...result.rows[0],
      active_pipeline_index
    }
  });
}

export async function markJobPosted(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (useDemo) {
    const job = mockJobs.get(id);
    if (!job || job.hr_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    mockJobs.set(id, { ...job, posted: true });
    return res.json({ ok: true, posted: true });
  }

  const updated = await pool.query(
    `UPDATE jobs SET posted = true WHERE id = $1 AND hr_id = $2 RETURNING id`,
    [id, userId]
  );
  if (updated.rowCount === 0) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await pool.query(`UPDATE job_steps SET status = 'pending' WHERE job_id = $1 AND step_order > 4`, [id]);
  await pool.query(
    `UPDATE job_steps SET status = 'completed' WHERE job_id = $1 AND step_order <= 3`,
    [id]
  );
  await pool.query(
    `UPDATE job_steps SET status = 'active' WHERE job_id = $1 AND step_order = 4`,
    [id]
  );

  return res.json({ ok: true, posted: true });
}
