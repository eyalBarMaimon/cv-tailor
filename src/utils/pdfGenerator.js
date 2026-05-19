import jsPDF from 'jspdf';

const BLUE = [44, 95, 138];
const DARK = [26, 26, 46];
const GRAY = [60, 60, 70];
const LIGHT_GRAY = [130, 130, 140];

function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

export function generateCVPdf(cvText, candidateName = 'Eyal Barmaimon') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  const today = new Date().toISOString().split('T')[0];

  let y = margin;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.text(candidateName.toUpperCase(), margin, y);
  y += 8;

  // Contact line – parse from text if present
  const contactMatch = cvText.match(/\n(.+?\|.+?)\n/);
  if (contactMatch) {
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT_GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(contactMatch[1].trim(), margin, y);
    y += 6;
  }

  // Divider
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  // Parse sections from CV text
  const sectionRegex = /^([A-Z][A-Z &]+)$/gm;
  const rawLines = cvText.split('\n');

  const SECTION_HEADERS = [
    'PROFESSIONAL PROFILE',
    'PROFESSIONAL SUMMARY',
    'SUMMARY',
    'CORE COMPETENCIES',
    'KEY COMPETENCIES',
    'COMPETENCIES',
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE',
    'EDUCATION & MILITARY',
    'EDUCATION',
    'TOOLS',
    'TOOLS & SOFTWARE',
    'LANGUAGES',
  ];

  const normalizeHeader = (line) =>
    line.trim().replace(/^\*+|\*+$/g, '').replace(/^#+\s*/, '').trim().toUpperCase();

  let currentSection = null;
  let buffer = [];

  const flushSection = (section, lines) => {
    if (!section || lines.length === 0) return;

    // Section title
    doc.setFontSize(10);
    doc.setTextColor(...BLUE);
    doc.setFont('helvetica', 'bold');
    doc.text(section, margin, y);

    // Underline
    const titleW = doc.getTextWidth(section);
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1, margin + titleW, y + 1);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);

    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        y += 2;
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bullet = '• ' + trimmed.slice(2);
        y = addWrappedText(doc, bullet, margin + 4, y, contentW - 4, 4.5);
      } else if (
        trimmed.match(/^\w.+\|\s*\d{4}/) ||
        trimmed.match(/^[A-Z][a-z].*\|.*\d{4}/)
      ) {
        // Company line
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        y = addWrappedText(doc, trimmed, margin, y, contentW, 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
      } else if (trimmed.match(/^[A-Z][a-z].*(Manager|Engineer|Director|VP|Lead|Analyst|Specialist)/)) {
        // Title line
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...LIGHT_GRAY);
        y = addWrappedText(doc, trimmed, margin, y, contentW, 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
      } else {
        y = addWrappedText(doc, trimmed, margin, y, contentW, 4.5);
      }
    });
    y += 4;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const isHeader = SECTION_HEADERS.includes(normalizeHeader(line));

    if (isHeader) {
      flushSection(currentSection, buffer);
      currentSection = normalizeHeader(line);
      buffer = [];
    } else if (
      i > 0 &&
      (rawLines[i - 1].trim() === '' || currentSection) &&
      line.trim() === candidateName.toUpperCase()
    ) {
      // Skip name line (already in header)
    } else if (currentSection) {
      buffer.push(line);
    }
  }
  flushSection(currentSection, buffer);

  // Fallback: if nothing was rendered (no sections matched), dump text as-is
  if (currentSection === null) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    rawLines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = margin; }
      const trimmed = line.trim();
      if (!trimmed) { y += 2; return; }
      const norm = normalizeHeader(line);
      if (SECTION_HEADERS.includes(norm)) {
        y += 2;
        doc.setFontSize(10);
        doc.setTextColor(...BLUE);
        doc.setFont('helvetica', 'bold');
        doc.text(norm, margin, y);
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        y = addWrappedText(doc, '• ' + trimmed.slice(2), margin + 4, y, contentW - 4, 4.5);
      } else {
        y = addWrappedText(doc, trimmed, margin, y, contentW, 4.5);
      }
    });
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`Generated ${today}`, margin, 290);

  doc.save(`Eyal_Barmaimon_CV_${today}.pdf`);
}
