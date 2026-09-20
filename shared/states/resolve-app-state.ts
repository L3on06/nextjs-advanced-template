import type { StateAction } from "@/components/app/app-state";
import {
  STATUS_VARIANTS,
  resolveStatus,
  type StatusContext,
  type StatusId,
  type StatusRule,
  type StatusVariant,
} from "@/shared/states/status-rules";
import type { TranslationKey } from "@/shared/translations";

export interface ResolvedAppState {
  variant: StatusVariant;
  titleKey: TranslationKey;
  messageKey: TranslationKey;
  action?: StateAction;
}

function keyFor(status: StatusId, part: "title" | "message"): TranslationKey {
  return `status_${status.replace(/-/g, "_")}_${part}` as TranslationKey;
}

/**
 * The chain: rule in, AppState props out. Returns null when no rule matches,
 * in which case the caller renders its own content (or nothing).
 */
export function resolveAppState(
  ctx: StatusContext,
  rules?: StatusRule[],
  action?: StateAction,
): ResolvedAppState | null {
  const status = resolveStatus(ctx, rules);
  if (status === null) return null;
  return {
    variant: STATUS_VARIANTS[status],
    titleKey: keyFor(status, "title"),
    messageKey: keyFor(status, "message"),
    action,
  };
}
