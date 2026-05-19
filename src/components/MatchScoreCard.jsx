import { useEffect, useState } from 'react';

function ScoreBar({ score, label }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 80 ? '#22c55e' : score >= 65 ? '#f97316' : '#ef4444';

  return (
    <div className="score-card">
      <div className="score-label">{label}</div>
      <div className="score-number" style={{ color }}>{score}%</div>
      <div className="score-bar-bg">
        <div
          className="score-bar-fill"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MatchScoreCard({ scoreBefore, scoreAfter, gapNote }) {
  return (
    <div className="match-score-section">
      <div className="score-cards-row">
        <ScoreBar score={scoreBefore} label="Match Before" />
        <ScoreBar score={scoreAfter} label="Match After" />
      </div>
      {gapNote && <p className="gap-note">💡 {gapNote}</p>}
    </div>
  );
}
