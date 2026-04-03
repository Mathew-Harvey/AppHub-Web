import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';
import TokenUsageMeter, { useBuilderUsage } from '../components/TokenUsageMeter';

const APP_TYPES = [
  { value: 'game', icon: '🎮', label: 'Game' },
  { value: 'tool', icon: '🛠️', label: 'Tool' },
  { value: 'dashboard', icon: '📊', label: 'Dashboard' },
  { value: 'form', icon: '📝', label: 'Form' },
  { value: 'calculator', icon: '🧮', label: 'Calculator' },
  { value: 'landing', icon: '🌐', label: 'Landing Page' },
  { value: 'other', icon: '✨', label: 'Other' },
];

const COLOR_SCHEMES = [
  { value: 'dark', icon: '🌙', label: 'Dark' },
  { value: 'light', icon: '☀️', label: 'Light' },
  { value: 'colorful', icon: '🎨', label: 'Colorful' },
  { value: 'minimal', icon: '⬜', label: 'Minimal' },
];

const LAYOUT_STYLES = [
  { value: 'centered', icon: '⏺️', label: 'Centered' },
  { value: 'sidebar', icon: '📐', label: 'Sidebar' },
  { value: 'fullscreen', icon: '🖥️', label: 'Fullscreen' },
  { value: 'dashboard', icon: '📊', label: 'Dashboard Grid' },
];

const FONT_STYLES = [
  { value: 'modern', icon: 'Aa', label: 'Modern' },
  { value: 'classic', icon: 'Aa', label: 'Classic', fontClass: 'font-classic' },
  { value: 'playful', icon: 'Aa', label: 'Playful', fontClass: 'font-playful' },
  { value: 'monospace', icon: '</>', label: 'Monospace', fontClass: 'font-mono' },
];

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'Simple', desc: 'A straightforward, focused app' },
  { value: 'moderate', label: 'Moderate', desc: 'Multiple features working together' },
  { value: 'complex', label: 'Complex', desc: 'Rich functionality with advanced logic' },
];

const TOTAL_STEPS = 4;

export default function BuilderNewPage() {
  const navigate = useNavigate();
  const { showToast, ToastElement } = useToast();
  const { usage } = useBuilderUsage();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [complexityWarning, setComplexityWarning] = useState(null);

  // Step 1
  const [name, setName] = useState('');
  const [appType, setAppType] = useState('');

  // Step 2
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');

  // Step 3
  const [colorScheme, setColorScheme] = useState('dark');
  const [layoutStyle, setLayoutStyle] = useState('centered');
  const [fontStyle, setFontStyle] = useState('modern');

  // Step 4
  const [complexity, setComplexity] = useState('moderate');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  function validateStep(s) {
    const e = {};
    if (s === 1) {
      if (!name.trim()) e.name = 'Give your app a name';
    }
    if (s === 2) {
      if (!description.trim()) e.description = 'Describe what you want to build';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setStep(s => Math.max(s - 1, 1));
  }

  function addFeature() {
    const val = featureInput.trim();
    if (!val || features.length >= 20) return;
    if (val.length > 300) { setErrors({ featureInput: 'Max 300 characters per feature' }); return; }
    setFeatures(prev => [...prev, val]);
    setFeatureInput('');
    setErrors({});
  }

  function removeFeature(idx) {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  }

  function handleFeatureKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addFeature(); }
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setErrors({});
    try {
      const body = {
        name: name.trim(),
        appType: appType || 'other',
        description: description.trim(),
        features,
        stylePreferences: { colorScheme, layoutStyle, fontStyle },
        complexity,
        targetAudience: targetAudience.trim(),
        additionalNotes: additionalNotes.trim(),
      };
      const data = await api.builderCreateSession(body);

      if (data.complexityWarning) {
        setComplexityWarning(data.complexityWarning);
        setSubmitting(false);
        return;
      }

      navigate(`/builder/${data.session?.id || data.id}`);
    } catch (err) {
      if (err.status === 400 && err.details) {
        const fieldErrors = {};
        err.details.forEach(d => { fieldErrors[d.field] = d.message; });
        setErrors(fieldErrors);
      } else if (err.status === 403) {
        navigate('/builder/upgrade');
      } else if (err.status === 429) {
        showToast('Token budget exceeded. Upgrade for more builds.', 'error');
      } else {
        showToast(err.message || 'Failed to create session', 'error');
      }
      setSubmitting(false);
    }
  }

  function handleContinueAnyway() {
    setComplexityWarning(null);
    setSubmitting(true);
    api.builderCreateSession({
      name: name.trim(),
      appType: appType || 'other',
      description: description.trim(),
      features,
      stylePreferences: { colorScheme, layoutStyle, fontStyle },
      complexity,
      targetAudience: targetAudience.trim(),
      additionalNotes: additionalNotes.trim(),
    }).then(data => {
      navigate(`/builder/${data.session?.id || data.id}`);
    }).catch(() => {
      showToast('Failed to create session', 'error');
      setSubmitting(false);
    });
  }

  function renderCardSelector(options, value, onChange) {
    return (
      <div className="builder-card-grid">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`builder-card-option ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="builder-card-icon">{opt.icon}</span>
            <span className="builder-card-label">{opt.label}</span>
            {opt.desc && <span className="builder-card-desc">{opt.desc}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="builder-new-page">
      <div className="builder-new-header">
        <Link to="/builder" className="btn btn-ghost btn-sm">&larr; Back to Builder</Link>
        <TokenUsageMeter usage={usage} compact />
      </div>

      <div className="builder-wizard">
        <div className="builder-progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`builder-progress-step ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`}
            >
              <div className="builder-progress-dot">{i + 1 < step ? '✓' : i + 1}</div>
              <span className="builder-progress-label">
                {['Basics', 'Describe', 'Style', 'Details'][i]}
              </span>
            </div>
          ))}
          <div className="builder-progress-bar">
            <div className="builder-progress-bar-fill" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
          </div>
        </div>

        {complexityWarning && (
          <div className="builder-complexity-warning">
            <strong>Complex App Detected</strong> &mdash; {complexityWarning}
            <div className="builder-complexity-actions">
              <button className="btn btn-primary btn-sm" onClick={handleContinueAnyway}>
                Continue Anyway
              </button>
              <Link to="/upload" className="btn btn-secondary btn-sm">
                Upload HTML Instead
              </Link>
            </div>
          </div>
        )}

        <div className="builder-step" key={step}>
          {step === 1 && (
            <>
              <h2 className="builder-step-title">What are you building?</h2>
              <p className="builder-step-sub">Let's start with the basics.</p>

              <div className="form-group">
                <label className="label">App Name</label>
                <input
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={100}
                  placeholder="My Awesome App"
                  autoFocus
                />
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label className="label">What type of app?</label>
                {renderCardSelector(APP_TYPES, appType, setAppType)}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="builder-step-title">Describe your app</h2>
              <p className="builder-step-sub">Don't worry about being too technical — describe it like you're telling a friend what you want.</p>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="A todo list app that helps me track daily tasks with categories and priority levels"
                />
                <span className="builder-char-count">{description.length} / 2000</span>
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>

              <div className="form-group">
                <label className="label">Features</label>
                <div className="builder-feature-input-row">
                  <input
                    className={`input ${errors.featureInput ? 'input-error' : ''}`}
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    maxLength={300}
                    placeholder="Add a feature, e.g. 'Dark mode toggle'"
                    disabled={features.length >= 20}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addFeature}
                    disabled={!featureInput.trim() || features.length >= 20}
                  >
                    Add
                  </button>
                </div>
                {errors.featureInput && <p className="error-text">{errors.featureInput}</p>}
                <span className="builder-char-count">{features.length} / 20 features</span>

                {features.length > 0 && (
                  <div className="builder-feature-tags">
                    {features.map((f, i) => (
                      <span key={i} className="builder-feature-tag">
                        {f}
                        <button type="button" onClick={() => removeFeature(i)}>&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="builder-step-title">Style preferences</h2>
              <p className="builder-step-sub">These are optional — we'll pick sensible defaults if you skip them.</p>

              <div className="form-group">
                <label className="label">Color Scheme</label>
                {renderCardSelector(COLOR_SCHEMES, colorScheme, setColorScheme)}
              </div>
              <div className="form-group">
                <label className="label">Layout</label>
                {renderCardSelector(LAYOUT_STYLES, layoutStyle, setLayoutStyle)}
              </div>
              <div className="form-group">
                <label className="label">Font Style</label>
                {renderCardSelector(FONT_STYLES, fontStyle, setFontStyle)}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="builder-step-title">Final details</h2>
              <p className="builder-step-sub">Almost done! Just a few more optional details.</p>

              <div className="form-group">
                <label className="label">Complexity</label>
                <div className="builder-radio-cards">
                  {COMPLEXITY_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`builder-radio-card ${complexity === opt.value ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="complexity"
                        value={opt.value}
                        checked={complexity === opt.value}
                        onChange={() => setComplexity(opt.value)}
                      />
                      <strong>{opt.label}</strong>
                      <span>{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Target Audience</label>
                <input
                  className="input"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  maxLength={255}
                  placeholder="Internal team members"
                />
              </div>

              <div className="form-group">
                <label className="label">Additional Notes</label>
                <textarea
                  className="input"
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Any other details or preferences..."
                />
                <span className="builder-char-count">{additionalNotes.length} / 2000</span>
              </div>
            </>
          )}
        </div>

        <div className="builder-wizard-actions">
          {step > 1 && (
            <button type="button" className="btn btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          <div className="builder-wizard-spacer" />
          {step < TOTAL_STEPS ? (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</> : 'Create Build Session'}
            </button>
          )}
        </div>
      </div>

      {ToastElement}
    </div>
  );
}
