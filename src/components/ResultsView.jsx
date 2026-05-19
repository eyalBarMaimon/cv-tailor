import { useRef } from 'react';
import { generateCVPdf } from '../utils/pdfGenerator';
import MatchScoreCard from './MatchScoreCard';

export default function ResultsView({ result, outputType, onBack }) {
  const textRef = useRef();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const downloadPdf = () => {
    generateCVPdf(result.text);
  };

  const isEmailType = outputType === 'email_paragraph';
  const isRTL = result?.language === 'he';

  return (
    <div className="results-view">
      <MatchScoreCard
        scoreBefore={result.scores.score_before}
        scoreAfter={result.scores.score_after}
        gapNote={result.scores.gap_note}
      />

      <div className="results-actions">
        {(outputType === 'full_cv' || outputType === 'profile_only' || outputType === 'bullets_only') && (
          <button className="btn btn-primary" onClick={downloadPdf}>
            ⬇ Download PDF
          </button>
        )}
        <button className="btn btn-secondary" onClick={copyToClipboard}>
          📋 Copy to Clipboard
        </button>
        {isEmailType && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              navigator.clipboard.writeText(result.text);
              alert('Email paragraph copied!');
            }}
          >
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
        <pre>{result.text}</pre>
      </div>
    </div>
  );
}
