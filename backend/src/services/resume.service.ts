import pdfParse from "pdf-parse";

export async function extractResumeText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
  }

  return file.buffer.toString("utf-8");
}
