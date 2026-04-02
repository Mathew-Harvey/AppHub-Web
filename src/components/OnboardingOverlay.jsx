import { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    target: null,
    title: 'Welcome to AppHub!',
    body: 'Your team\'s portal for sharing internal tools, calculators, and dashboards — all built as simple HTML apps.',
    icon: '🚀',
    position: 'center',
  },
  {
    target: '[data-onboarding="nav-apps"]',
    title: 'Your Apps Dashboard',
    body: 'All your team\'s apps live here. Click any app to open it. Long-press to rearrange or delete.',
    icon: '📱',
    position: 'below',
  },
  {
    target: '[data-onboarding="nav-upload"]',
    title: 'Upload an App',
    body: 'Drag & drop an HTML file, paste code, or upload any file — Pro users get AI auto-conversion.',
    icon: '📤',
    position: 'below',
  },
  {
    target: '[data-onboarding="invite-btn"]',
    title: 'Invite Your Team',
    body: 'Add team members so they can access and contribute apps to your workspace.',
    icon: '👥',
    position: 'below',
  },
  {
    target: '[data-onboarding="nav-settings"]',
    title: 'Customize Your Workspace',
    body: 'Brand your workspace with custom colors and a logo. Manage members and billing here.',
    icon: '⚙️',
    position: 'below',
  },
  {
    target: null,
    title: 'You\'re all set!',
    body: 'Build something useful with any AI tool (Claude, ChatGPT, Cursor), then upload the HTML file to share it with your team.',
    icon: '🎉',
    position: 'center',
  },
];

export default function OnboardingOverlay({ onComplete }) {
  const [step, setStep] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const tooltipRef = useRef(null);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (!current.target) {
      setSpotlightStyle(null);
      setTooltipStyle(null);
      return;
    }

    const el = document.querySelector(current.target);
    if (!el) {
      setSpotlightStyle(null);
      setTooltipStyle(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = 6;
    setSpotlightStyle({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      borderRadius: 10,
    });

    // Position tooltip below or above the target
    requestAnimationFrame(() => {
      const tt = tooltipRef.current;
      if (!tt) return;
      const ttRect = tt.getBoundingClientRect();
      let top = rect.bottom + 12;
      let left = rect.left + rect.width / 2 - ttRect.width / 2;

      // Keep within viewport
      if (left < 16) left = 16;
      if (left + ttRect.width > window.innerWidth - 16) left = window.innerWidth - ttRect.width - 16;
      if (top + ttRect.height > window.innerHeight - 16) {
        top = rect.top - ttRect.height - 12;
      }

      setTooltipStyle({ top, left });
    });
  }, [step, current.target]);

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  }

  function handleSkip() {
    onComplete();
  }

  const isCentered = current.position === 'center';

  return (
    <div className="onboarding-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleNext(); }}>
      {/* Spotlight cutout */}
      {spotlightStyle && <div className="onboarding-spotlight" style={spotlightStyle} />}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`onboarding-tooltip ${isCentered ? 'onboarding-tooltip-center' : ''}`}
        style={isCentered ? undefined : tooltipStyle || { opacity: 0 }}
      >
        <div className="onboarding-tooltip-icon">{current.icon}</div>
        <h3 className="onboarding-tooltip-title">{current.title}</h3>
        <p className="onboarding-tooltip-body">{current.body}</p>

        <div className="onboarding-tooltip-footer">
          <div className="onboarding-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
            ))}
          </div>
          <div className="onboarding-actions">
            {!isLast && (
              <button className="btn btn-ghost btn-sm" onClick={handleSkip}>Skip</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        <div className="onboarding-step-count">
          {step + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  );
}
