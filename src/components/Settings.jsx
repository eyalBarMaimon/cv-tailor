import { useState, useEffect } from 'react';
import { isSupported, linkFile, getLinkedFile, unlinkFile, mobileBackup } from '../utils/fileSync';

export default function Settings() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('cv_tailor_api_key') || ''
  );
  const [saved, setSaved] = useState(false);
  const [linkedFileName, setLinkedFileName] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    getLinkedFile().then((handle) => {
      if (handle) setLinkedFileName(handle.name);
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    localStorage.setItem('cv_tailor_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear the API key?')) {
      localStorage.removeItem('cv_tailor_api_key');
      setApiKey('');
    }
  };

  const handleLinkFile = async () => {
    setLinking(true);
    try {
      const handle = await linkFile();
      setLinkedFileName(handle.name);
    } catch (e) {
      if (e.name !== 'AbortError') alert('לא הצלחתי לקשר את הקובץ: ' + e.message);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    await unlinkFile();
    setLinkedFileName(null);
  };

  const handleMobileBackup = async () => {
    try {
      await mobileBackup();
    } catch (e) {
      if (e.name !== 'AbortError') alert('שגיאה בייצוא: ' + e.message);
    }
  };

  return (
    <div className="screen">
      <h2 className="screen-title">Settings</h2>

      <div className="settings-card">
        <h3>Groq API Key (חינמי)</h3>
        <p className="settings-hint">
          הירשם ב-<a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a> → API Keys → Create API Key.
          חינמי לחלוטין, ללא כרטיס אשראי.
        </p>
        <ol className="settings-steps">
          <li>לך ל-<a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a></li>
          <li>הירשם עם חשבון Google</li>
          <li>לחץ <strong>API Keys → Create API Key</strong></li>
          <li>העתק את המפתח (מתחיל ב-<code>gsk_</code>)</li>
        </ol>
        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            placeholder="gsk_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="form-row gap-sm">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved!' : '💾 Save Key'}
          </button>
          {apiKey && <button className="btn btn-ghost" onClick={handleClear}>Clear</button>}
        </div>
      </div>

      <div className="settings-card">
        <h3>📊 גיבוי אוטומטי ל-Excel</h3>
        {!isSupported() ? (
          <>
            <p className="settings-hint">
              גיבוי ברקע לא נתמך בדפדפן זה. לחץ להוריד/לשתף קובץ Excel עם כל ההיסטוריה:
            </p>
            <button className="btn btn-primary" onClick={handleMobileBackup}>
              📥 הורד גיבוי Excel
            </button>
          </>
        ) : linkedFileName ? (
          <>
            <div className="sync-status sync-active">
              <span>✓ מקושר ל-<strong>{linkedFileName}</strong></span>
            </div>
            <p className="settings-hint">
              כל שינוי בהיסטוריה (הוספה, מחיקה, עדכון) נשמר ישירות לקובץ ברקע.
            </p>
            <button className="btn btn-ghost" onClick={handleUnlink}>ניתוק הקובץ</button>
          </>
        ) : (
          <>
            <p className="settings-hint">
              בחר היכן לשמור קובץ גיבוי — האפליקציה תכתוב אליו אוטומטית אחרי כל שינוי, ללא חלונות הורדה.
            </p>
            <button className="btn btn-primary" onClick={handleLinkFile} disabled={linking}>
              {linking ? 'מקשר...' : '📂 צור קובץ גיבוי Excel'}
            </button>
          </>
        )}
      </div>

      <div className="settings-card">
        <h3>About</h3>
        <p>CV Tailor – Eyal Barmaimon</p>
        <p className="settings-hint">Powered by Groq · Llama 3.3 70B (חינמי).</p>
      </div>
    </div>
  );
}
