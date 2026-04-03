import { useAuth } from '../contexts/AuthContext';

const DEV_MODE = import.meta.env.DEV;

export function usePlan() {
  const { user } = useAuth();
  const ws = user?.workspace;
  const rawPlan = ws?.plan || 'free';
  const workspacePlan = ws?.workspacePlan || rawPlan;

  const isPaid = DEV_MODE ? true : (rawPlan !== 'free');
  const isPro = DEV_MODE ? true : (rawPlan === 'pro');
  const plan = DEV_MODE ? 'pro' : rawPlan;

  const limits = ws?.planLimits;
  const maxApps = DEV_MODE ? null : (limits?.maxApps ?? null);
  const maxMembers = DEV_MODE ? null : (limits?.maxMembers ?? null);
  const hasAppBuilder = DEV_MODE ? true : (limits?.appBuilder === true);

  // Invited members are on free tier but workspace may have a paid plan
  const isInvitedMember = user?.role === 'member';
  const workspaceHasPaidPlan = DEV_MODE ? false : (workspacePlan !== 'free');

  return { plan, workspacePlan, isPaid, isPro, maxApps, maxMembers, hasAppBuilder, isInvitedMember, workspaceHasPaidPlan };
}

export function isPlanLimitError(err) {
  if (DEV_MODE) return false;
  return err?.error === 'plan_limit' || err?.error === 'upgrade_required';
}
