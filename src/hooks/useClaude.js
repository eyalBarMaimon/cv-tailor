import { useState, useRef } from 'react';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

export function useClaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const stopClaude = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  const callClaude = async (prompt) => {
    const apiKey = localStorage.getItem('cv_tailor_api_key');
    if (!apiKey) throw new Error('API key not set');

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 3000,
          temperature: 0.4,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';

      const firstLine = rawText.split('\n')[0].trim();
      let scores = { score_before: 0, score_after: 0, gap_note: '' };
      try {
        scores = JSON.parse(firstLine.replace(/^```json?|```$/g, '').trim());
      } catch {
        const match = rawText.match(/\{[^}]*"score_before"[^}]*\}/);
        if (match) { try { scores = JSON.parse(match[0]); } catch { /* keep defaults */ } }
      }

      const bodyText = rawText.split('\n').slice(1).join('\n').trim();
      return { scores, text: bodyText, raw: rawText, company: scores.company || '', jobTitle: scores.job_title || '' };
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('הופסק על ידי המשתמש');
      throw e;
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return { callClaude, stopClaude, loading, error, setError };
}
