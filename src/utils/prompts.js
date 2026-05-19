export const OUTPUT_TYPES = [
  { value: 'full_cv', label: 'Full tailored CV' },
  { value: 'profile_only', label: 'Professional Profile only' },
  { value: 'bullets_only', label: 'Bullet points only' },
  { value: 'cover_letter', label: 'Cover letter' },
  { value: 'email_paragraph', label: 'Short email paragraph' },
];

export function buildPrompt(jobDescription, outputType, language, cvText) {
  const langInstruction =
    language === 'he'
      ? 'Write the output in Hebrew (RTL). Keep technical terms in English where appropriate.'
      : 'Write the output in English.';

  const outputInstructions = {
    full_cv: `Rewrite the full CV, tailored to this job description. Keep all sections but emphasize relevant experience. Use the same structure as the original CV. Keep the name and contact info unchanged. Use "Engineering Manager" as the primary title at Tingo Medical. Do NOT include any home address. Spanish is Basic level only.`,
    profile_only: `Write only a tailored Professional Profile paragraph (4–6 sentences) optimized for this job description.`,
    bullets_only: `Write tailored bullet points for the most relevant experience sections only. Use concise action-oriented language.`,
    cover_letter: `Write a professional cover letter (3–4 paragraphs) tailored to this job description. Address it to the hiring team. Sign off as Eyal Barmaimon.`,
    email_paragraph: `Write a short, confident email paragraph (3–5 sentences) that Eyal can send as an initial outreach or application email. Be direct and highlight the most relevant match.`,
  };

  return `STEP 1 — output exactly this JSON on line 1 (no other text on that line):
{"score_before": X, "score_after": Y, "gap_note": "max 12 words", "company": "hiring company name or empty string", "job_title": "exact job title from description"}

Where score_before = match % of original CV to job (0-100), score_after = match % after tailoring (0-100), gap_note = one sentence gap or strength note (max 12 words), company = company name from job description (empty string if not mentioned), job_title = exact job title as written in the job description.

STEP 2 — ${outputInstructions[outputType]}

${langInstruction}

---
JOB DESCRIPTION:
${jobDescription}

---
CANDIDATE CV:
${cvText}`;
}
