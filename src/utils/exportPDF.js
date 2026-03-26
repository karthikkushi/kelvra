// src/utils/exportPDF.js
import { jsPDF } from "jspdf";

export function exportStudyKitPDF(topic, results) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin     = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helpers ──
  const checkNewPage = (neededHeight = 20) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    doc.setFillColor(13, 15, 20);
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setTextColor(110, 231, 183);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("KELVRA AI STUDY APP", margin, 8);
    doc.setTextColor(150, 150, 150);
    doc.text(topic.toUpperCase(), pageWidth - margin, 8, { align: "right" });
  };

  const addSectionTitle = (title, icon = "") => {
    checkNewPage(20);
    doc.setFillColor(20, 23, 31);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
    doc.setTextColor(110, 231, 183);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${icon} ${title}`.trim(), margin + 4, y + 7);
    y += 16;
  };

  const addText = (text, size = 10, color = [220, 220, 220], bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth - 4);
    const height = lines.length * (size * 0.4 + 1);
    checkNewPage(height + 4);
    doc.text(lines, margin + 2, y);
    y += height + 3;
  };

  const addBullet = (text) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    const lines = doc.splitTextToSize(`• ${text}`, contentWidth - 8);
    const height = lines.length * 4.5;
    checkNewPage(height + 2);
    doc.text(lines, margin + 4, y);
    y += height + 2;
  };

  // ── COVER PAGE ──
  doc.setFillColor(13, 15, 20);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Green accent line
  doc.setFillColor(110, 231, 183);
  doc.rect(margin, 60, 4, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(topic, contentWidth - 20);
  doc.text(titleLines, margin + 12, 75);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(110, 231, 183);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Generated Study Kit", margin + 12, 108);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin + 12, 116);

  // Contents list
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Contents:", margin + 12, 135);
  let contentY = 143;
  const contents = [];
  if (results.summary)    contents.push("Summary & Key Points");
  if (results.flashcards) contents.push(`${results.flashcards.length} Flashcards`);
  if (results.quiz)       contents.push(`${results.quiz.length} Quiz Questions`);
  if (results.plan)       contents.push("5-Day Study Plan");
  contents.forEach((item) => {
    doc.setTextColor(110, 231, 183);
    doc.text("→", margin + 12, contentY);
    doc.setTextColor(200, 200, 200);
    doc.text(item, margin + 20, contentY);
    contentY += 8;
  });

  // Kelvra branding at bottom
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("kelvra.app — Study Smarter with AI", pageWidth / 2, pageHeight - 15, { align: "center" });

  // ── CONTENT PAGES ──
  doc.addPage();
  doc.setFillColor(13, 15, 20);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  addHeader();
  y = 20;

  // ── SUMMARY ──
  if (results.summary) {
    addSectionTitle("SUMMARY");
    results.summary.paragraphs?.forEach((p) => {
      addText(p, 10, [200, 200, 200]);
      y += 2;
    });
    if (results.summary.points?.length > 0) {
      y += 4;
      addText("KEY POINTS", 9, [110, 231, 183], true);
      results.summary.points.forEach((p) => addBullet(p));
    }
    y += 8;
  }

  // ── FLASHCARDS ──
  if (results.flashcards?.length > 0) {
    checkNewPage(30);
    addSectionTitle("FLASHCARDS");
    results.flashcards.forEach((card, i) => {
      checkNewPage(30);
      // Card number
      doc.setFillColor(28, 32, 48);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(110, 231, 183);
      doc.setFont("helvetica", "bold");
      doc.text(`CARD ${i + 1}`, margin + 3, y + 5);
      // Question
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.setFont("helvetica", "bold");
      const qLines = doc.splitTextToSize(`Q: ${card.question}`, contentWidth - 8);
      doc.text(qLines.slice(0, 2), margin + 3, y + 11);
      // Answer
      doc.setFontSize(8);
      doc.setTextColor(150, 200, 170);
      doc.setFont("helvetica", "normal");
      const aLines = doc.splitTextToSize(`A: ${card.answer}`, contentWidth - 8);
      doc.text(aLines.slice(0, 2), margin + 3, y + 20);
      y += 30;
    });
    y += 5;
  }

  // ── QUIZ ──
  if (results.quiz?.length > 0) {
    checkNewPage(40);
    addSectionTitle("QUIZ QUESTIONS");
    results.quiz.forEach((q, i) => {
      checkNewPage(50);
      doc.setFillColor(20, 23, 31);
      doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${i + 1}: ${q.question}`, margin + 3, y + 4.5, { maxWidth: contentWidth - 6 });
      y += 10;
      // Options
      const opts = q.options || {};
      Object.entries(opts).forEach(([key, val]) => {
        const isCorrect = key === q.correct;
        doc.setFontSize(8);
        doc.setFont("helvetica", isCorrect ? "bold" : "normal");
        doc.setTextColor(isCorrect ? 110 : 150, isCorrect ? 231 : 150, isCorrect ? 183 : 150);
        const optLines = doc.splitTextToSize(`${key}) ${val}${isCorrect ? " ✓" : ""}`, contentWidth - 10);
        doc.text(optLines, margin + 6, y);
        y += optLines.length * 4.5 + 1;
      });
      y += 4;
    });
  }

  // ── STUDY PLAN ──
  if (results.plan?.length > 0) {
    checkNewPage(30);
    addSectionTitle("5-DAY STUDY PLAN");
    results.plan.forEach((day) => {
      checkNewPage(25);
      doc.setFillColor(28, 32, 48);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(110, 231, 183);
      doc.setFont("helvetica", "bold");
      doc.text(`DAY ${day.day}: ${day.theme}`, margin + 3, y + 5.5);
      if (day.duration) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`${day.duration} min`, pageWidth - margin - 3, y + 5.5, { align: "right" });
      }
      y += 12;
      day.tasks?.forEach((task) => addBullet(task));
      y += 3;
    });
  }

  // Last page footer
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Generated by Kelvra AI — kelvra.app", pageWidth / 2, pageHeight - 10, { align: "center" });

  // Save
  const fileName = `${topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_kelvra_study_kit.pdf`;
  doc.save(fileName);
  return fileName;
}
