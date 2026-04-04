import { useAuth } from '../contexts/AuthContext';

const DEV_MODE = import.meta.env.DEV;

export function usePlan() {
  const { user } = useAuth();
  const ws = user?.workspace;
  const rawPlan = ws?.plan || 'free';

  const isPaid = DEV_MODE ? true : (rawPlan !== 'free');
  const plan = DEV_MODE ? 'power' : rawPlan;

  const limits = ws?.planLimits;
  const maxApps = DEV_MODE ? null : (limits?.maxApps ?? null);
  const maxMembers = DEV_MODE ? null : (limits?.maxMembers ?? null);
  const hasAppBuilder = DEV_MODE ? true : (limits?.appBuilder === true);

  return { plan, isPaid, maxApps, maxMembers, hasAppBuilder };
}

export function isPlanLimitError(err) {
  if (DEV_MODE) return false;
  return err?.error === 'plan_limit' || err?.error === 'upgrade_required';
}
