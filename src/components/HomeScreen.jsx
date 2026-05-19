import { useState } from 'react';
import { useCV } from '../hooks/useCV';
import { useClaude } from '../hooks/useClaude';
import { useJobHistory } from '../hooks/useJobHistory';
import { buildPrompt, OUTPUT_TYPES } from '../utils/prompts';
import { cvToText } from '../utils/cvData';
import ResultsView from './ResultsView';

export default function HomeScreen({ onApiKeyNeeded }) {
  const { cv } = useCV();
  const { callClaude, stopClaude, loading } = useClaude();
  const { addEntry } = useJobHistory();

  const [jobDescription, setJobDescription] = useState('');
  const [outputType, setOutputType] = useState('full_cv');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTailor = async () => {
    const apiKey = localStorage.getItem('cv_tailor_api_key');
    if (!apiKey) { onApiKeyNeeded(); return; }
    if (!jobDescription.trim()) { setError('Please paste a job description first.'); return; }
    setError('');

    try {
      const cvText = cvToText(cv);
      const prompt = buildPrompt(jobDescription, outputType, language, cvText);
      const res = await callClaude(prompt);
      setResult({ ...res, language });
      addEntry({
        scoreBefore: res.scores.score_before,
        scoreAfter: res.scores.score_after,
        company: res.company || '',
        jobTitle: res.jobTitle || '',
        notes: res.scores.gap_note || '',
      });
    } catch (e) {
      if (e.message !== 'הופסק על ידי המשתמש') {
        setError(e.message || 'Something went wrong. Check your API key.');
      }
    }
  };

  const handleStop = () => {
    stopClaude();
    setError('');
  };

  if (result) {
    return <ResultsView result={result} outputType={outputType} onBack={() => setResult(null)} />;
  }

  return (
    <div className="screen">
      <h2 className="screen-title">Tailor Your CV</h2>

      <div className="form-group">
        <label>Paste Job Description</label>
        <textarea
          className="job-textarea"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>Output Type</label>
          <select value={outputType} onChange={(e) => setOutputType(e.target.value)} disabled={loading}>
            {OUTPUT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Language</label>
          <div className="lang-toggle">
            <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')} disabled={loading}>EN</button>
            <button className={`lang-btn ${language === 'he' ? 'active' : ''}`} onClick={() => setLanguage('he')} disabled={loading}>HE</button>
          </div>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <div className="loading-row">
          <button className="btn btn-primary flex-1" disabled>
            <span className="spinner" /> Analyzing job description...
          </button>
          <button className="btn btn-stop" onClick={handleStop} title="עצור">
            ⏹ עצור
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-full" onClick={handleTailor}>
          ✨ Tailor CV
        </button>
      )}
    </div>
  );
}
