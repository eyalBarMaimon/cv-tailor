import { useRef, useState } from 'react';
import { generateCVPdf } from '../utils/pdfGenerator';
import MatchScoreCard from './MatchScoreCard';

export default function ResultsView({ result, outputType, onBack, emailIntroSeparator }) {
  const textRef = useRef();
  const [emailCopied, setEmailCopied] = useState(false);
  const [mainCopied, setMainCopied] = useState(false);

  const isRTL = result?.language === 'he';

  // Split out email intro paragraph if present
  const sep = emailIntroSeparator || '---EMAIL_INTRO---';
  const [mainText, emailIntroText] = result.text.includes(sep)
    ? result.text.split(sep).map((s) => s.trim())
    : [result.text, null];

  const copyMain = () => {
    navigator.clipboard.writeText(mainText).then(() => {
      setMainCopied(true);
      setTimeout(() => setMainCopied(false), 2000);
    });
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(emailIntroText).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const downloadPdf = () => {
    generateCVPdf(mainText);
  };

  return (
    <div className="results-view">
      <MatchScoreCard
        scoreBefore={result.scores.score_before}
        scoreAfter={result.scores.score_after}
        gapNote={result.scores.gap_note}
      />

      {emailIntroText && (
        <div className="email-intro-card">
          <div className="email-intro-header">
            <span>📧 פסקת מייל לשליחה עם קורות החיים</span>
            <button className="btn btn-sm btn-secondary" onClick={copyEmail}>
              {emailCopied ? '✓ הועתק!' : '📋 העתק'}
            </button>
          </div>
          <p
            className="email-intro-text"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          >
            {emailIntroText}
          </p>
        </div>
      )}

      <div className="results-actions">
        {(outputType === 'full_cv' || outputType === 'profile_only' || outputType === 'bullets_only') && (
          <button className="btn btn-primary" onClick={downloadPdf}>
            ⬇ Download PDF
          </button>
        )}
        <button className="btn btn-secondary" onClick={copyMain}>
          {mainCopied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
        {outputType === 'email_paragraph' && (
          <button className="btn btn-secondary" onClick={copyMain}>
            ✉ Copy Email Paragraph
          </button>
        )}
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div
        className="results-text"
        ref={textRef}
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
      >
        <pre>{mainText}</pre>
      </div>
    </div>
  );
}
