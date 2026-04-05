import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { useToast } from './Toast';

// ─── Step definitions ────────────────────────────────────────────────────────

const APP_CATEGORIES = [
  { key: 'calculator', icon: '🧮', label: 'Calculator / Tool', hint: 'Crunch numbers, convert units, compute results' },
  { key: 'form', icon: '📝', label: 'Form / Data Entry', hint: 'Collect information, surveys, intake forms' },
  { key: 'dashboard', icon: '📊', label: 'Dashboard / Display', hint: 'Show data, charts, status boards' },
  { key: 'tracker', icon: '📋', label: 'Tracker / Logger', hint: 'Log time, habits, inventory, progress' },
  { key: 'generator', icon: '⚡', label: 'Generator / Creator', hint: 'Generate documents, reports, templates' },
  { key: 'reference', icon: '📖', label: 'Reference / Guide', hint: 'Lookup tables, cheat sheets, directories' },
  { key: 'game', icon: '🎮', label: 'Game / Interactive', hint: 'Quizzes, games, interactive exercises' },
  { key: 'other', icon: '🔧', label: 'Something else', hint: 'Describe it in the next step' },
];

const AUDIENCE_OPTIONS = [
  { key: 'myself', label: 'Just me' },
  { key: 'team', label: 'My team at work' },
  { key: 'customers', label: 'Customers / clients' },
  { key: 'public', label: 'General public' },
];

const STYLE_OPTIONS = [
  { key: 'clean', label: 'Clean & minimal' },
  { key: 'professional', label: 'Professional & corporate' },
  { key: 'friendly', label: 'Friendly & approachable' },
  { key: 'bold', label: 'Bold & colourful' },
  { key: 'dark', label: 'Dark mode' },
];

const EXTRAS_FREE = [
  { key: 'mobile', label: 'Mobile-friendly' },
  { key: 'print', label: 'Print-friendly' },
  { key: 'csv', label: 'Export to CSV' },
  { key: 'charts', label: 'Charts / graphs' },
  { key: 'localstorage', label: 'Remember data between visits' },
  { key: 'validation', label: 'Input validation & error messages' },
];

const EXTRAS_PAID = [
  ...EXTRAS_FREE,
  { key: 'animations', label: 'Smooth animations & transitions' },
  { key: 'multipage', label: 'Multiple tabs / pages' },
  { key: 'search', label: 'Search & filter' },
  { key: 'darklight', label: 'Dark / light mode toggle' },
  { key: 'drag', label: 'Drag & drop' },
  { key: 'pdf', label: 'Generate PDF' },
];

// ─── Paid-only deeper questions ──────────────────────────────────────────────

const DATA_INPUT_EXAMPLES = {
  calculator: 'e.g. numbers, prices, quantities, dates, measurements',
  form: 'e.g. name, email, phone, address, dropdown selections',
  dashboard: 'e.g. sales figures, status updates, dates, categories',
  tracker: 'e.g. date, hours, project name, category, notes',
  generator: 'e.g. title, content blocks, template fields, logo',
  reference: 'e.g. search terms, filter categories, sort options',
  game: 'e.g. player name, difficulty level, answer choices',
  other: 'e.g. describe what the user types, selects, or uploads',
};

const DATA_OUTPUT_EXAMPLES = {
  calculator: 'e.g. totals, subtotals with tax, comparison results',
  form: 'e.g. confirmation message, summary of entries, reference number',
  dashboard: 'e.g. charts, KPI cards, progress bars, status indicators',
  tracker: 'e.g. weekly summary table, totals, streaks, CSV export',
  generator: 'e.g. formatted document, printable page, downloadable file',
  reference: 'e.g. filtered list, detail cards, highlighted matches',
  game: 'e.g. score, correct answers, leaderboard, results summary',
  other: 'e.g. describe what the user should see or get back',
};

// ─── Prompt assembly (pure logic, no AI) ─────────────────────────────────────

function assemblePrompt(answers, isPaid) {
  const lines = [];

  lines.push('Build me a single, self-contained HTML file for the following app:\n');

  // What it is
  const cat = APP_CATEGORIES.find(c => c.key === answers.category);
  if (answers.category === 'other' && answers.otherCategory) {
    lines.push(`## App type\n${answers.otherCategory}\n`);
  } else if (cat) {
    lines.push(`## App type\n${cat.label} — ${cat.hint}\n`);
  }

  // Purpose
  if (answers.purpose) {
    lines.push(`## What it does\n${answers.purpose}\n`);
  }

  // Audience
  const aud = AUDIENCE_OPTIONS.find(a => a.key === answers.audience);
  if (aud) {
    lines.push(`## Who it's for\n${aud.label}\n`);
  }

  // Inputs (paid tier — detailed)
  if (isPaid && answers.inputs) {
    lines.push(`## User inputs\n${answers.inputs}\n`);
  }

  // Outputs (paid tier — detailed)
  if (isPaid && answers.outputs) {
    lines.push(`## Expected output\n${answers.outputs}\n`);
  }

  // Step-by-step (paid tier — the peanut butter sandwich bit)
  if (isPaid && answers.steps) {
    lines.push(`## Step-by-step user flow\nWhen a user opens this app, here's exactly what happens:\n${answers.steps}\n`);
  }

  // Sample data (paid tier)
  if (isPaid && answers.sampleData) {
    lines.push(`## Sample data to include\n${answers.sampleData}\n`);
  }

  // Style
  const style = STYLE_OPTIONS.find(s => s.key === answers.style);
  if (style) {
    lines.push(`## Visual style\n${style.label}\n`);
  }

  // Extras
  if (answers.extras?.length) {
    const extraList = (isPaid ? EXTRAS_PAID : EXTRAS_FREE);
    const labels = answers.extras.map(k => extraList.find(e => e.key === k)?.label).filter(Boolean);
    if (labels.length) {
      lines.push(`## Extra features\n${labels.map(l => `- ${l}`).join('\n')}\n`);
    }
  }

  // Specific details
  if (answers.details) {
    lines.push(`## Additional details\n${answers.details}\n`);
  }

  // Technical requirements (always)
  lines.push(`## Technical requirements
- Everything in ONE index.html file — no separate CSS or JS files
- Inline all styles in a <style> tag
- Inline all JavaScript in a <script> tag
- Include proper HTML5 doctype, <head> with meta charset and viewport
- No external data sources — all data must live inside the file
- No external images — use inline SVGs, CSS shapes, or emoji for icons
- CDN scripts are OK (e.g. Chart.js, React) if needed
- Must work when opened directly in a browser with no build step
- Make it responsive and mobile-friendly`);

  return lines.join('\n');
}

// ─── Step count helper ───────────────────────────────────────────────────────

function getSteps(isPaid) {
  if (isPaid) {
    return ['category', 'purpose', 'audience', 'inputs', 'outputs', 'steps', 'style', 'extras', 'details', 'review'];
  }
  return ['category', 'purpose', 'audience', 'style', 'extras', 'details', 'review'];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PromptBuilder({ isPaid, onClose, onAutoBuild }) {
  const { showToast, ToastElement } = useToast();
  const [answers, setAnswers] = useState({
    category: '',
    otherCategory: '',
    purpose: '',
    audience: '',
    inputs: '',
    outputs: '',
    steps: '',
    sampleData: '',
    style: '',
    extras: [],
    details: '',
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = getSteps(isPaid);
  const currentStep = steps[stepIndex];
  const isReview = currentStep === 'review';
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  function set(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function toggleExtra(key) {
    setAnswers(prev => ({
      ...prev,
      extras: prev.extras.includes(key)
        ? prev.extras.filter(k => k !== key)
        : [...prev.extras, key],
    }));
  }

  function canAdvance() {
    switch (currentStep) {
      case 'category': return !!answers.category;
      case 'purpose': return answers.purpose.trim().length >= 5;
      case 'audience': return !!answers.audience;
      case 'inputs': return true; // optional but shown
      case 'outputs': return true;
      case 'steps': return true;
      case 'style': return !!answers.style;
      case 'extras': return true;
      case 'details': return true;
      default: return true;
    }
  }

  function next() { if (canAdvance() && stepIndex < steps.length - 1) setStepIndex(stepIndex + 1); }
  function back() { if (stepIndex > 0) setStepIndex(stepIndex - 1); }

  async function handleCopy() {
    const prompt = assemblePrompt(answers, isPaid);
    try {
      await copyToClipboard(prompt);
      setCopied(true);
      showToast('Prompt copied — paste it into your AI tool', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Failed to copy', 'error');
    }
  }

  function handleAutoBuild() {
    const prompt = assemblePrompt(answers, isPaid);
    if (onAutoBuild) onAutoBuild(prompt);
  }

  const prompt = isReview ? assemblePrompt(answers, isPaid) : '';

  return (
    <div className="prompt-builder">
      <div className="prompt-builder-header">
        <h3>Describe your app</h3>
        <button className="prompt-builder-close" onClick={onClose}>&times;</button>
      </div>

      {/* Progress */}
      <div className="prompt-builder-progress">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`prompt-builder-dot ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="prompt-builder-body">
        {/* ─── Step: Category ──────────────────────────────────────────── */}
        {currentStep === 'category' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">What kind of app do you want to build?</label>
            <div className="prompt-builder-choices">
              {APP_CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`prompt-builder-choice ${answers.category === c.key ? 'selected' : ''}`}
                  onClick={() => set('category', c.key)}
                >
                  <span className="prompt-builder-choice-icon">{c.icon}</span>
                  <span className="prompt-builder-choice-label">{c.label}</span>
                  <span className="prompt-builder-choice-hint">{c.hint}</span>
                </button>
              ))}
            </div>
            {answers.category === 'other' && (
              <input
                className="input"
                value={answers.otherCategory}
                onChange={e => set('otherCategory', e.target.value)}
                placeholder="Describe the type of app..."
                autoFocus
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        )}

        {/* ─── Step: Purpose ───────────────────────────────────────────── */}
        {currentStep === 'purpose' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">What's the ONE main thing this app does?</label>
            <p className="prompt-builder-hint">Be specific. Not "a calculator" but "a quote calculator that adds line items, applies a discount code, and shows a total with GST."</p>
            <textarea
              className="input"
              value={answers.purpose}
              onChange={e => set('purpose', e.target.value)}
              placeholder='e.g. "A tool where I enter a client name, add billable hours for each day of the week, and see a weekly total with my hourly rate applied."'
              rows={4}
              autoFocus
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        {/* ─── Step: Audience ──────────────────────────────────────────── */}
        {currentStep === 'audience' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">Who will use this app?</label>
            <div className="prompt-builder-choice-row">
              {AUDIENCE_OPTIONS.map(a => (
                <button
                  key={a.key}
                  className={`prompt-builder-pill ${answers.audience === a.key ? 'selected' : ''}`}
                  onClick={() => set('audience', a.key)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step: Inputs (paid only) ────────────────────────────────── */}
        {currentStep === 'inputs' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">What does the user type, select, or enter?</label>
            <p className="prompt-builder-hint">List every input field. Think: if you were explaining this to someone who's never seen your work, what would they need to type in?</p>
            <textarea
              className="input"
              value={answers.inputs}
              onChange={e => set('inputs', e.target.value)}
              placeholder={DATA_INPUT_EXAMPLES[answers.category] || DATA_INPUT_EXAMPLES.other}
              rows={4}
              autoFocus
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        {/* ─── Step: Outputs (paid only) ───────────────────────────────── */}
        {currentStep === 'outputs' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">What should the user see or get back?</label>
            <p className="prompt-builder-hint">Describe the result. A number? A table? A chart? A printable page? What exactly appears after they hit the button?</p>
            <textarea
              className="input"
              value={answers.outputs}
              onChange={e => set('outputs', e.target.value)}
              placeholder={DATA_OUTPUT_EXAMPLES[answers.category] || DATA_OUTPUT_EXAMPLES.other}
              rows={4}
              autoFocus
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        {/* ─── Step: Steps (paid only — the PB&J step) ─────────────────── */}
        {currentStep === 'steps' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">Walk through it step by step</label>
            <p className="prompt-builder-hint">Imagine you're watching someone use this app for the first time. What do they do first? Then what? Then what? Describe every click and screen change — assume nothing is obvious.</p>
            <textarea
              className="input"
              value={answers.steps}
              onChange={e => set('steps', e.target.value)}
              placeholder={'1. User opens the app and sees...\n2. They click on... and a form appears with...\n3. They fill in... and hit the "Calculate" button\n4. The app shows... with a breakdown of...\n5. They can click "Export" to download...'}
              rows={6}
              autoFocus
              style={{ resize: 'vertical' }}
            />
            {!answers.sampleData && (
              <div style={{ marginTop: 12 }}>
                <label className="prompt-builder-hint" style={{ fontWeight: 500 }}>Got example data? (optional)</label>
                <textarea
                  className="input"
                  value={answers.sampleData}
                  onChange={e => set('sampleData', e.target.value)}
                  placeholder='e.g. "Client: Acme Corp, Hours: Mon 3h, Tue 5h, Wed 4h, Rate: $120/hr"'
                  rows={2}
                  style={{ resize: 'vertical', marginTop: 6 }}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── Step: Style ─────────────────────────────────────────────── */}
        {currentStep === 'style' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">How should it look?</label>
            <div className="prompt-builder-choice-row">
              {STYLE_OPTIONS.map(s => (
                <button
                  key={s.key}
                  className={`prompt-builder-pill ${answers.style === s.key ? 'selected' : ''}`}
                  onClick={() => set('style', s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step: Extras ────────────────────────────────────────────── */}
        {currentStep === 'extras' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">Any extra features?</label>
            <p className="prompt-builder-hint">Select all that apply — or skip this step.</p>
            <div className="prompt-builder-extras">
              {(isPaid ? EXTRAS_PAID : EXTRAS_FREE).map(e => (
                <label key={e.key} className={`prompt-builder-extra ${answers.extras.includes(e.key) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={answers.extras.includes(e.key)}
                    onChange={() => toggleExtra(e.key)}
                  />
                  {e.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step: Details ───────────────────────────────────────────── */}
        {currentStep === 'details' && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">Anything else the AI should know?</label>
            <p className="prompt-builder-hint">Specific colours, branding, formulas, business rules, edge cases — anything you'd tell a developer on their first day. Skip if nothing comes to mind.</p>
            <textarea
              className="input"
              value={answers.details}
              onChange={e => set('details', e.target.value)}
              placeholder="e.g. Use our brand colour #2a7de1. GST rate is 15%. Always round to 2 decimal places."
              rows={4}
              autoFocus
              style={{ resize: 'vertical' }}
            />
          </div>
        )}

        {/* ─── Review ──────────────────────────────────────────────────── */}
        {isReview && (
          <div className="prompt-builder-step">
            <label className="prompt-builder-question">Your prompt is ready</label>
            <p className="prompt-builder-hint">
              {isPaid
                ? 'Copy it to use with any AI tool, or let us build the app for you automatically.'
                : 'Copy this prompt and paste it into ChatGPT, Claude, or any AI tool to generate your app.'}
            </p>
            <pre className="prompt-builder-preview">{prompt}</pre>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="prompt-builder-nav">
        {!isFirst && (
          <button className="btn btn-ghost btn-sm" onClick={back}>Back</button>
        )}
        <div style={{ flex: 1 }} />
        {isReview ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy prompt'}
            </button>
            {isPaid && onAutoBuild && (
              <button className="btn btn-primary btn-sm" onClick={handleAutoBuild}>
                Build with AI
              </button>
            )}
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={next}
            disabled={!canAdvance()}
          >
            Next
          </button>
        )}
      </div>
      {ToastElement}
    </div>
  );
}
