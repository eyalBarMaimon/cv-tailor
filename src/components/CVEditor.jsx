import { useState } from 'react';
import { useCV } from '../hooks/useCV';
import { DEFAULT_CV } from '../utils/cvData';

export default function CVEditor() {
  const { cv, saveCV, resetCV } = useCV();
  const [draft, setDraft] = useState(cv);
  const [saved, setSaved] = useState(false);

  const update = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const updateExp = (index, field, value) => {
    const exp = [...draft.experience];
    exp[index] = { ...exp[index], [field]: value };
    setDraft((d) => ({ ...d, experience: exp }));
  };

  const updateBullets = (index, bulletText) => {
    const bullets = bulletText.split('\n').map((b) => b.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
    const exp = [...draft.experience];
    exp[index] = { ...exp[index], bullets };
    setDraft((d) => ({ ...d, experience: exp }));
  };

  const handleSave = () => {
    saveCV(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset CV to default? This cannot be undone.')) {
      resetCV();
      setDraft(DEFAULT_CV);
    }
  };

  return (
    <div className="screen">
      <h2 className="screen-title">Edit CV</h2>

      <Section title="Contact Info">
        <FieldRow label="Full Name">
          <input value={draft.name} onChange={(e) => update('name', e.target.value)} />
        </FieldRow>
        <FieldRow label="Contact Line">
          <input value={draft.contact} onChange={(e) => update('contact', e.target.value)} />
        </FieldRow>
      </Section>

      <Section title="Professional Profile">
        <textarea
          rows={5}
          value={draft.profile}
          onChange={(e) => update('profile', e.target.value)}
        />
      </Section>

      <Section title="Core Competencies">
        <textarea
          rows={4}
          value={draft.competencies}
          onChange={(e) => update('competencies', e.target.value)}
        />
      </Section>

      <Section title="Experience">
        {draft.experience.map((exp, i) => (
          <div key={i} className="exp-block">
            <div className="form-row">
              <FieldRow label="Company">
                <input value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} />
              </FieldRow>
              <FieldRow label="Period">
                <input value={exp.period} onChange={(e) => updateExp(i, 'period', e.target.value)} />
              </FieldRow>
            </div>
            <FieldRow label="Title">
              <input value={exp.title} onChange={(e) => updateExp(i, 'title', e.target.value)} />
            </FieldRow>
            <FieldRow label="Bullets (one per line)">
              <textarea
                rows={exp.bullets.length + 1}
                value={exp.bullets.map((b) => `• ${b}`).join('\n')}
                onChange={(e) => updateBullets(i, e.target.value)}
              />
            </FieldRow>
          </div>
        ))}
      </Section>

      <Section title="Education & Military">
        <textarea
          rows={4}
          value={draft.education}
          onChange={(e) => update('education', e.target.value)}
        />
      </Section>

      <Section title="Tools & Software">
        <textarea
          rows={3}
          value={draft.tools}
          onChange={(e) => update('tools', e.target.value)}
        />
      </Section>

      <Section title="Languages">
        <textarea
          rows={2}
          value={draft.languages}
          onChange={(e) => update('languages', e.target.value)}
        />
      </Section>

      <div className="editor-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved!' : '💾 Save CV'}
        </button>
        <button className="btn btn-ghost" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="editor-section">
      <h3 className="editor-section-title">{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}
