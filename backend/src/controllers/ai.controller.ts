import { Request, Response } from "express";
import { processAI } from "../services/ai.service.js";

export async function processAIController(req: Request, res: Response) {
  const taskType = req.body?.task_type;
  if (!taskType) {
    return res.status(400).json({ message: "task_type is required" });
  }

  const data = await processAI(req.body);
  return res.json({ data });
}
