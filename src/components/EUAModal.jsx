import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const EUA_VERSION = '2026-04';
const STORAGE_KEY = 'apphub-eua-accepted';

export function hasAcceptedEUA() {
  return localStorage.getItem(STORAGE_KEY) === EUA_VERSION;
}

export default function EUAModal({ onAccept }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    function handleScroll() {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
      if (atBottom) setScrolledToBottom(true);
    }

    if (el.scrollHeight <= el.clientHeight) {
      setScrolledToBottom(true);
    }

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, EUA_VERSION);
    onAccept();
  }

  return (
    <div className="modal-overlay eua-modal-overlay">
      <div className="modal eua-modal" onClick={e => e.stopPropagation()}>
        <div className="eua-modal-header">
          <h2>End User Licence Agreement</h2>
          <p>Please review and accept our terms to continue</p>
        </div>

        <div className="eua-modal-body" ref={bodyRef}>
          <p className="eua-modal-updated">Last updated: April 2026</p>

          <section className="eua-modal-section">
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing or using the App Hub (&ldquo;the Platform&rdquo;), you agree to be bound by this End User Licence Agreement (&ldquo;Agreement&rdquo;). If you do not agree to these terms, do not use the Platform.</p>
          </section>

          <section className="eua-modal-section">
            <h4>2. Licence Grant</h4>
            <p>You are granted a non-exclusive, non-transferable, revocable licence to access and use the tools and applications made available through the Platform solely for your internal business operations. This licence does not include the right to sublicense, resell, or redistribute any part of the Platform.</p>
          </section>

          <section className="eua-modal-section">
            <h4>3. Permitted Use</h4>
            <p>The Platform and its tools are intended for use by professionals and teams across all industries. You agree to use the Platform only for lawful purposes and in accordance with this Agreement.</p>
          </section>

          <section className="eua-modal-section">
            <h4>4. Third-Party and User-Created Applications</h4>
            <p>The Platform operator makes no representations, warranties, or guarantees of any kind regarding Third-Party Apps. Use of any Third-Party App is entirely at your own risk.</p>
          </section>

          <section className="eua-modal-section">
            <h4>5. Fair Use</h4>
            <p>Where AI-powered features are included, access is subject to reasonable fair use limits. The Platform operator reserves the right to apply usage thresholds or rate limiting where usage is excessive or automated.</p>
          </section>

          <section className="eua-modal-section">
            <h4>6. Subscription and Payment</h4>
            <p>Access to the Platform is provided on a subscription basis. All fees are in Australian Dollars (AUD) and are exclusive of GST unless stated otherwise.</p>
          </section>

          <section className="eua-modal-section">
            <h4>7. Intellectual Property</h4>
            <p>All software, tools, designs, content, and underlying technology on the Platform are the intellectual property of the Platform operator or its licensors.</p>
          </section>

          <section className="eua-modal-section">
            <h4>8. Disclaimer of Warranties</h4>
            <p>The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; No warranties, express or implied, are made regarding the accuracy, reliability, or fitness for a particular purpose of any tool or output.</p>
          </section>

          <section className="eua-modal-section">
            <h4>9. Limitation of Liability</h4>
            <p>Total liability for any claim shall not exceed the total fees paid by you in the 3 months preceding the claim. No liability is accepted for any indirect, incidental, special, consequential, or punitive damages.</p>
          </section>

          <section className="eua-modal-section">
            <h4>10. Safety-Critical Notice</h4>
            <p>Certain tools on the Platform (including dive tables and decompression references) are provided for general reference only. Users are solely responsible for verifying information used in dive planning, safety management, or operational decisions.</p>
          </section>

          <section className="eua-modal-section">
            <h4>11. Data and Privacy</h4>
            <p>User data is collected and processed in accordance with the Platform Privacy Policy. User data is not sold to third parties.</p>
          </section>

          <section className="eua-modal-section">
            <h4>12. Termination</h4>
            <p>Access may be suspended or terminated if you breach this Agreement. You may cancel your subscription at any time.</p>
          </section>

          <section className="eua-modal-section">
            <h4>13. Governing Law</h4>
            <p>This Agreement is governed by the laws of Western Australia, Australia.</p>
          </section>

          <section className="eua-modal-section">
            <h4>14. Amendments</h4>
            <p>This Agreement may be updated from time to time. Continued use of the Platform after notice of an updated Agreement constitutes acceptance of the revised terms.</p>
          </section>
        </div>

        <div className="eua-modal-footer">
          <p className="eua-modal-hint">
            <Link to="/eua" target="_blank">Read the full agreement</Link>
          </p>
          <button
            className="btn btn-primary btn-full"
            onClick={handleAccept}
            disabled={!scrolledToBottom}
          >
            {scrolledToBottom ? 'I Accept' : 'Scroll to review all terms'}
          </button>
        </div>
      </div>
    </div>
  );
}
