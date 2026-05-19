import { useState } from 'react';
import * as XLSX from 'xlsx';
import { SEED_HISTORY } from '../utils/seedHistory';
import { syncEntriesToFile } from '../utils/fileSync';

const STORAGE_KEY = 'cv_tailor_job_history';

function parseScore(val) {
  if (typeof val === 'number') return val;
  const n = parseInt(String(val).replace('%', ''), 10);
  return isNaN(n) ? 0 : n;
}

function extractCompany(desc) {
  if (!desc) return '';
  const match = desc.match(/^([^–\-\n.،,]{3,50})\s*[–-]/u);
  if (match) {
    const candidate = match[1].trim();
    if (/^(לחברה|חברה|ארגון|גוף)/.test(candidate)) return '';
    return candidate;
  }
  return '';
}

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HISTORY));
    return SEED_HISTORY;
  } catch {
    return SEED_HISTORY;
  }
}

function downloadXlsx(entries) {
  const rows = entries.map((e) => ({
    'תאריך': e.date,
    'חברה': e.company || '',
    'כותרת המשרה': e.jobTitle || '',
    'התאמה לפני': e.scoreBefore ? `${e.scoreBefore}%` : '',
    'התאמה אחרי': e.scoreAfter ? `${e.scoreAfter}%` : '',
    'סטטוס': e.status || '',
    'הערות': e.notes || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'משרות');
  XLSX.writeFile(wb, 'Job_Tracker.xlsx');
}

export function useJobHistory() {
  const [history, setHistory] = useState(loadInitial);

  const persist = (updated) => {
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    syncEntriesToFile(updated).catch(() => {});
  };

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      company: '',
      jobTitle: '',
      scoreBefore: 0,
      scoreAfter: 0,
      status: 'Reviewing',
      notes: '',
      ...entry,
    };
    const updated = [newEntry, ...history];
    persist(updated);
    return newEntry.id;
  };

  const updateEntry = (id, changes) => {
    persist(history.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  const deleteEntry = (id) => {
    persist(history.filter((e) => e.id !== id));
  };

  const importFromXlsx = (rows) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntries = rows
      .filter((r) => r['כותרת המשרה'] || r['jobTitle'] || r['Job Title'])
      .map((r, i) => ({
        id: Date.now() + i,
        date: today,
        company:
          r['company'] || r['Company'] ||
          extractCompany(r['תיאור מלא של המשרה'] || ''),
        jobTitle: r['כותרת המשרה'] || r['jobTitle'] || r['Job Title'] || '',
        scoreBefore: parseScore(r['התאמה לפני שינוי'] || r['scoreBefore'] || 0),
        scoreAfter: parseScore(r['התאמה אחרי שינוי'] || r['scoreAfter'] || 0),
        status: r['status'] || r['Status'] || 'Reviewing',
        notes: [
          r['נקודות ששונו ב-CV'] || r['notes'] || '',
          r['סוג תפקיד'] ? `סוג: ${r['סוג תפקיד']}` : '',
          r['מיקום'] && r['מיקום'] !== 'לא צוין' ? `מיקום: ${r['מיקום']}` : '',
        ].filter(Boolean).join(' | '),
      }));

    const existingKeys = new Set(history.map((e) => `${e.jobTitle}|${e.date}`));
    const fresh = newEntries.filter((e) => !existingKeys.has(`${e.jobTitle}|${e.date}`));
    persist([...fresh, ...history]);
    return fresh.length;
  };

  const exportCSV = () => {
    const headers = ['Date', 'Company', 'Job Title', 'Score Before', 'Score After', 'Status', 'Notes'];
    const rows = history.map((e) => [
      e.date, e.company, e.jobTitle, e.scoreBefore, e.scoreAfter, e.status,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_Tailor_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXlsx = () => downloadXlsx(history);

  return { history, addEntry, updateEntry, deleteEntry, exportCSV, exportXlsx, importFromXlsx };
}
