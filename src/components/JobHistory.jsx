import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useJobHistory } from '../hooks/useJobHistory';

const STATUS_OPTIONS = ['Reviewing', 'Applied', 'Rejected', 'Offer'];

const STATUS_COLOR = {
  Reviewing: '#f97316',
  Applied:   '#3b82f6',
  Rejected:  '#ef4444',
  Offer:     '#22c55e',
};

export default function JobHistory() {
  const { history, updateEntry, deleteEntry, exportCSV, exportXlsx, importFromXlsx } = useJobHistory();
  const fileRef = useRef();
  const [importMsg, setImportMsg] = useState('');

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const count = importFromXlsx(rows);
        setImportMsg(`✓ יובאו ${count} רשומות`);
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('שגיאה בקריאת הקובץ');
      }
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="screen">
      <div className="history-header">
        <h2 className="screen-title">Job History</h2>
        <div className="history-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>📥</button>
          {history.length > 0 && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={exportXlsx}>📊</button>
              <button className="btn btn-secondary btn-sm" onClick={exportCSV}>⬇ CSV</button>
            </>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileImport} />
      {importMsg && <p className="import-msg">{importMsg}</p>}

      {history.length === 0 ? (
        <p className="empty-state">אין רשומות עדיין. ייבא Excel או תאם CV להתחלה.</p>
      ) : (
        <div className="job-cards">
          {history.map((entry) => (
            <JobCard key={entry.id} entry={entry} onUpdate={updateEntry} onDelete={deleteEntry} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ entry, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-card-title-row">
          <div className="job-card-titles">
            <input
              className="card-input card-input-title"
              value={entry.jobTitle || ''}
              placeholder="Job Title"
              onChange={(e) => onUpdate(entry.id, { jobTitle: e.target.value })}
            />
            <input
              className="card-input card-input-company"
              value={entry.company || ''}
              placeholder="Company"
              onChange={(e) => onUpdate(entry.id, { company: e.target.value })}
            />
          </div>
          <button className="btn-icon" onClick={() => onDelete(entry.id)} title="מחק">🗑</button>
        </div>

        <div className="job-card-meta">
          <span className="job-card-date">{entry.date}</span>
          <div className="job-card-scores">
            <ScorePill score={entry.scoreBefore} label="לפני" />
            <span className="score-arrow">→</span>
            <ScorePill score={entry.scoreAfter} label="אחרי" />
          </div>
          <select
            className="status-select"
            value={entry.status || 'Reviewing'}
            style={{ borderColor: STATUS_COLOR[entry.status] || '#999' }}
            onChange={(e) => onUpdate(entry.id, { status: e.target.value })}
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {entry.notes && (
        <div className="job-card-notes">
          <button className="notes-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? '▲ הסתר הערות' : '▼ הצג הערות'}
          </button>
          {expanded && (
            <textarea
              className="card-notes-input"
              value={entry.notes || ''}
              rows={3}
              onChange={(e) => onUpdate(entry.id, { notes: e.target.value })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ScorePill({ score, label }) {
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f97316' : score === 0 ? '#999' : '#ef4444';
  return (
    <span className="score-pill-inline" style={{ color }}>
      <span className="score-pill-label">{label}</span>
      <strong>{score > 0 ? `${score}%` : '—'}</strong>
    </span>
  );
}
