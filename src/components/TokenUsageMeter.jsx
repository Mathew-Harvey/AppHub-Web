import { computePercentage } from '../contexts/BuilderContext';

function formatTokens(n) {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function timeUntil(dateString) {
  if (!dateString) return '';
  const ms = new Date(dateString).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const days = Math.floor(ms / 86_400_000);
  if (days > 30) return `in ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  const hours = Math.floor(ms / 3_600_000);
  return `in ${hours} hour${hours > 1 ? 's' : ''}`;
}

export default function TokenUsageMeter({ usage, compact = false }) {
  if (!usage) return null;

  if (usage.unlimited) {
    return (
      <div className={`token-meter ${compact ? 'token-meter-compact' : ''}`}>
        <div className="token-meter-header">
          <span className="token-meter-label">Token Usage</span>
          <span className="token-meter-unlimited">Unlimited</span>
        </div>
        {usage.used > 0 && (
          <span className="token-meter-sub">{formatTokens(usage.used)} tokens used this cycle</span>
        )}
      </div>
    );
  }

  const pct = Math.min(computePercentage(usage), 100);
  const hasLimit = usage.limit > 0;
  const color = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';
  const isOver = computePercentage(usage) >= 100;

  return (
    <div className={`token-meter ${compact ? 'token-meter-compact' : ''} ${isOver ? 'token-meter-over' : ''}`}>
      <div className="token-meter-header">
        <span className="token-meter-label">Token Usage</span>
        <span className="token-meter-value">
          {hasLimit ? (
            <>
              {formatTokens(usage.used)} / {formatTokens(usage.limit)}
              <span className="token-meter-pct"> ({pct.toFixed(0)}%)</span>
            </>
          ) : (
            <>{formatTokens(usage.used)} used</>
          )}
        </span>
      </div>
      {hasLimit && (
        <div className="token-meter-track">
          <div
            className="token-meter-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      )}
      <div className="token-meter-footer">
        {isOver ? (
          <a href="/settings" className="token-meter-upgrade">
            Upgrade to Power User for unlimited builds
          </a>
        ) : (
          <span className="token-meter-sub">Resets {timeUntil(usage.resetAt)}</span>
        )}
      </div>
    </div>
  );
}
