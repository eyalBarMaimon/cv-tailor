import { useState, useEffect, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import CVEditor from './components/CVEditor';
import JobHistory from './components/JobHistory';
import Settings from './components/Settings';
import { restorePermission, hasStoredHandle } from './utils/fileSync';
import './index.css';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'editor', label: 'Editor', icon: '✏️' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function ApiKeyModal({ onClose }) {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem('cv_tailor_api_key', key.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Groq API Key (חינמי)</h3>
        <p className="settings-hint">
          הירשם ב-console.groq.com → API Keys → Create API Key.
          חינמי לחלוטין, ללא כרטיס אשראי. נשמר רק בדפדפן שלך.
        </p>
        <input
          type="password"
          placeholder="gsk_..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            Save &amp; Continue
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;
  return <div className="offline-banner">You are offline</div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showApiModal, setShowApiModal] = useState(false);
  const [, forceUpdate] = useState(0);
  const [syncActive, setSyncActive] = useState(false);
  const permRestored = useRef(false);

  const hasApiKey = !!localStorage.getItem('cv_tailor_api_key');

  // Restore file permission on first user interaction (required by browser security)
  useEffect(() => {
    const onFirstClick = async () => {
      if (permRestored.current) return;
      permRestored.current = true;
      document.removeEventListener('click', onFirstClick);
      const fileName = await hasStoredHandle();
      if (!fileName) return;
      const handle = await restorePermission();
      setSyncActive(!!handle);
    };
    document.addEventListener('click', onFirstClick);
    return () => document.removeEventListener('click', onFirstClick);
  }, []);

  const handleApiModalClose = () => {
    setShowApiModal(false);
    forceUpdate((n) => n + 1);
  };

  const screens = {
    home: <HomeScreen onApiKeyNeeded={() => setShowApiModal(true)} />,
    editor: <CVEditor />,
    history: <JobHistory />,
    settings: <Settings />,
  };

  return (
    <div className="app">
      <OfflineBanner />

      <header className="app-header">
        <span className="app-logo">
          CV Tailor
          {syncActive && <span className="sync-dot" title="גיבוי אוטומטי פעיל" />}
        </span>
        <div className="header-actions">
          <button
            className="api-key-btn"
            onClick={() => setShowApiModal(true)}
            title="Update API Key"
          >
            🔑 {hasApiKey ? 'API Key ✓' : 'Set API Key'}
          </button>
          <button
            className="close-btn"
            onClick={() => window.close()}
            title="סגור"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="app-main">{screens[activeTab]}</main>

      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {showApiModal && <ApiKeyModal onClose={handleApiModalClose} />}
    </div>
  );
}
