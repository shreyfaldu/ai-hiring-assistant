/**
 * Builds a simple A4 PDF from the job description and triggers a browser download.
 * Dynamic import keeps jsPDF out of the initial bundle.
 */
export async function downloadJobDescriptionPdf(jobTitle: string, jobDescription: string) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const heading = jobTitle.trim() || "Job Description";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(heading, maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = jobDescription.replace(/\r\n/g, "\n").trim();
  const lines = doc.splitTextToSize(body.length ? body : "—", maxWidth);
  const lineHeight = 14;

  for (let i = 0; i < lines.length; i += 1) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

  const safeFile =
    heading
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "job-description";
  doc.save(`${safeFile}.pdf`);
}
