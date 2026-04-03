import { useState, useRef } from 'react';
import { api } from '../utils/api';

const EDIT_QUESTIONS = [
  {
    id: 'editType',
    label: 'What do you need?',
    type: 'choice',
    options: [
      { value: 'fix', label: 'Fix something broken', icon: '🔧' },
      { value: 'enhance', label: 'Add or improve a feature', icon: '✨' },
      { value: 'redesign', label: 'Change how it looks', icon: '🎨' },
      { value: 'other', label: 'Something else', icon: '💡' },
    ],
  },
  {
    id: 'whatHappens',
    label: 'What is currently happening?',
    sublabel: 'Describe what you see or experience right now',
    type: 'textarea',
    placeholder: 'e.g. "When I click the Calculate button, nothing happens" or "The chart shows but the numbers are wrong"',
  },
  {
    id: 'whatShouldHappen',
    label: 'What should happen instead?',
    sublabel: 'Describe the result you want',
    type: 'textarea',
    placeholder: 'e.g. "It should show the total price including tax" or "I want a dark mode toggle in the top right corner"',
  },
  {
    id: 'extraContext',
    label: 'Anything else that might help?',
    sublabel: 'Optional — mention specific buttons, sections, or data involved',
    type: 'textarea',
    placeholder: 'e.g. "The issue only happens with negative numbers" or "I want it to match our brand color #e94560"',
    optional: true,
  },
];

export default function EditAppModal({ app, plan, onClose, onUpdated }) {
  const isGuidedTier = plan === 'creator' || plan === 'pro' || plan === 'business' || plan === 'power';
  const [downloading, setDownloading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  // Guided edit state (creator/pro)
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);

  async function handleDownloadSource() {
    setDownloading(true);
    setError('');
    try {
      const { html, filename } = await api.downloadSource(app.id);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download app code');
    } finally {
      setDownloading(false);
    }
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('appFile', uploadFile);
      const data = await api.updateAppFile(app.id, formData);
      onUpdated(data.app);
    } catch (err) {
      setError(err.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file) {
    if (file) {
      setUploadFile(file);
      setError('');
    }
  }

  // Guided flow helpers
  const currentQuestion = EDIT_QUESTIONS[step];
  const isLastStep = step === EDIT_QUESTIONS.length - 1;

  function canAdvance() {
    if (!currentQuestion) return false;
    if (currentQuestion.optional) return true;
    return !!answers[currentQuestion.id]?.trim();
  }

  function handleNext() {
    if (isLastStep) return;
    setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleGuidedSubmit() {
    setGenerating(true);
    setError('');
    try {
      // Download the source, build the prompt, and copy to clipboard
      const { html, filename } = await api.downloadSource(app.id);

      const prompt = buildEditPrompt(app.name, answers, filename);
      const fullText = prompt + '\n\n---\n\nHere is the current app code:\n\n```html\n' + html + '\n```';

      await navigator.clipboard.writeText(fullText);
      setGenerating(false);
      setStep(EDIT_QUESTIONS.length); // Go to "copied" confirmation step
    } catch {
      setError('Failed to prepare edit instructions. Try downloading the code manually instead.');
      setGenerating(false);
    }
  }

  // Free / Teams tier: download + reupload flow
  if (!isGuidedTier) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{app.icon}</span>
            <h3 style={{ fontSize: 16 }}>Edit {app.name}</h3>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              <strong>Step 1:</strong> Download your app's code, then give it to an AI (like ChatGPT or Claude) and describe what you want changed.
            </p>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadSource}
              disabled={downloading}
              style={{ width: '100%', marginBottom: 16 }}
            >
              {downloading ? <span className="spinner" /> : '⬇ Download App Code'}
            </button>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              <strong>Step 2:</strong> Once the AI gives you the updated code, save it as an HTML file and upload it here.
            </p>

            <div
              className={`upload-zone${dragOver ? ' dragover' : ''}`}
              style={{ marginBottom: 0 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="upload-zone-icon">📄</div>
              <h3>{uploadFile ? uploadFile.name : 'Drop updated HTML file here'}</h3>
              <p>{uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB — click Upload to apply` : 'or click to browse'}</p>
              <input ref={fileRef} type="file" accept=".html,.htm" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} style={{ display: 'none' }} />
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            {uploadFile && (
              <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? <span className="spinner" /> : 'Upload & Update'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Creator / Pro tier: guided questionnaire
  // Confirmation step after copy
  if (step === EDIT_QUESTIONS.length) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Copied to clipboard!</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Your edit instructions and app code have been copied. Paste this into an AI assistant
              (like ChatGPT or Claude) to get the updated code, then come back and use <strong>Update File</strong> to apply it.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>{app.icon}</span>
          <h3 style={{ fontSize: 16 }}>Edit {app.name}</h3>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {step + 1} of {EDIT_QUESTIONS.length}
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label" style={{ fontSize: 15, marginBottom: 4 }}>{currentQuestion.label}</label>
          {currentQuestion.sublabel && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{currentQuestion.sublabel}</p>
          )}

          {currentQuestion.type === 'choice' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`btn ${answers[currentQuestion.id] === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '12px 8px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                  onClick={() => {
                    setAnswers({ ...answers, [currentQuestion.id]: opt.value });
                    // Auto-advance after choosing
                    setTimeout(() => setStep(step + 1), 200);
                  }}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'textarea' && (
            <textarea
              className="input"
              rows={4}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {EDIT_QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)' : 'var(--border)',
                opacity: i <= step ? 1 : 0.4,
                cursor: i < step ? 'pointer' : 'default',
              }}
              onClick={() => { if (i < step) setStep(i); }}
            />
          ))}
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <button className="btn btn-ghost btn-sm" onClick={step > 0 ? handleBack : onClose}>
            {step > 0 ? '← Back' : 'Cancel'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {currentQuestion.optional && !isLastStep && (
              <button className="btn btn-ghost btn-sm" onClick={handleNext}>Skip</button>
            )}
            {isLastStep ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleGuidedSubmit}
                disabled={generating || (!canAdvance() && !currentQuestion.optional)}
              >
                {generating ? <span className="spinner" /> : '📋 Copy Instructions to Clipboard'}
              </button>
            ) : (
              currentQuestion.type !== 'choice' && (
                <button className="btn btn-primary btn-sm" onClick={handleNext} disabled={!canAdvance()}>
                  Next →
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildEditPrompt(appName, answers, filename) {
  const typeLabels = { fix: 'Fix a bug', enhance: 'Add or improve a feature', redesign: 'Change the visual design', other: 'Other change' };
  const parts = [
    `I need help editing my app "${appName}" (${filename}).`,
    '',
    `**Type of change:** ${typeLabels[answers.editType] || answers.editType || 'Not specified'}`,
  ];
  if (answers.whatHappens) {
    parts.push('', `**What is currently happening:** ${answers.whatHappens}`);
  }
  if (answers.whatShouldHappen) {
    parts.push('', `**What should happen instead:** ${answers.whatShouldHappen}`);
  }
  if (answers.extraContext) {
    parts.push('', `**Additional context:** ${answers.extraContext}`);
  }
  parts.push('', 'Please return the complete updated HTML file with the changes applied. Keep all existing functionality intact unless I specifically asked to change it.');
  return parts.join('\n');
}
