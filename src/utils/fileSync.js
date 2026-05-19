import * as XLSX from 'xlsx';

const DB_NAME = 'cv_tailor_db';
const STORE = 'file_handles';
const KEY = 'job_tracker_handle';

// In-memory cache of the active handle — avoids repeated permission requests
let _activeHandle = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export function isSupported() {
  return typeof window !== 'undefined' && ('showOpenFilePicker' in window || 'showSaveFilePicker' in window);
}

// Check if a handle is stored without requesting permission
export async function hasStoredHandle() {
  try {
    const handle = await loadHandle();
    return handle ? handle.name : null;
  } catch {
    return null;
  }
}

// Called once on first user gesture — silently restores permission
export async function restorePermission() {
  if (_activeHandle) return _activeHandle;
  try {
    const handle = await loadHandle();
    if (!handle) return null;
    // queryPermission first — if already granted, no dialog needed
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      _activeHandle = handle;
      return handle;
    }
    // requestPermission requires a user gesture — Chrome auto-grants for known files
    const req = await handle.requestPermission({ mode: 'readwrite' });
    if (req === 'granted') {
      _activeHandle = handle;
      return handle;
    }
    return null;
  } catch {
    return null;
  }
}

export async function linkFile() {
  let handle;
  if ('showOpenFilePicker' in window) {
    // Prefer open picker — user selects their existing Job_Tracker.xlsx
    const [picked] = await window.showOpenFilePicker({
      types: [{
        description: 'Excel Workbook',
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
      }],
      excludeAcceptAllOption: false,
      multiple: false,
    });
    // Ensure we have write permission
    const perm = await picked.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      const req = await picked.requestPermission({ mode: 'readwrite' });
      if (req !== 'granted') throw new Error('נדרשת הרשאת כתיבה לקובץ');
    }
    handle = picked;
  } else {
    // Fallback for browsers that only support showSaveFilePicker
    handle = await window.showSaveFilePicker({
      suggestedName: 'Job_Tracker.xlsx',
      types: [{
        description: 'Excel Workbook',
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
      }],
    });
  }
  await saveHandle(handle);
  _activeHandle = handle;
  return handle;
}

export async function getLinkedFile() {
  if (_activeHandle) return _activeHandle;
  return restorePermission();
}

export async function unlinkFile() {
  _activeHandle = null;
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = resolve;
  });
}

function buildXlsx(entries) {
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
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

export async function syncEntriesToFile(entries) {
  const handle = await getLinkedFile();
  if (!handle) return false;
  try {
    const buf = buildXlsx(entries);
    const writable = await handle.createWritable();
    await writable.write(new Blob([buf]));
    await writable.close();
    return true;
  } catch {
    // Handle became invalid — clear cache so next call re-tries
    _activeHandle = null;
    return false;
  }
}
