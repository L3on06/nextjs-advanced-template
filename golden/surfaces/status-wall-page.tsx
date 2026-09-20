import { AppPage } from "@/components/app/app-page";
import { AppState } from "@/components/app/app-state";
import { resolveAppState } from "@/shared/states/resolve-app-state";
import { STATUS_IDS, type StatusContext } from "@/shared/states/status-rules";

const CONTEXTS: Record<(typeof STATUS_IDS)[number], StatusContext> = {
  maintenance: { path: "/", roles: [], permissions: [], flags: { maintenance: true }, session: { state: "active" }, online: true },
  offline: { path: "/", roles: [], permissions: [], flags: {}, session: { state: "active" }, online: false },
  "no-results": { path: "/", roles: [], permissions: [], flags: {}, session: { state: "active" }, online: true, content: "none", query: "x" },
  empty: { path: "/", roles: [], permissions: [], flags: {}, session: { state: "active" }, online: true, content: "none" },
  "session-expired": { path: "/", roles: [], permissions: [], flags: {}, session: { state: "expired" }, online: true },
  "verification-required": { path: "/", roles: [], permissions: [], flags: {}, session: { state: "unverified" }, online: true },
  "account-disabled": { path: "/", roles: [], permissions: [], flags: {}, session: { state: "disabled" }, online: true },
  "setup-required": { path: "/", roles: [], permissions: [], flags: {}, session: { state: "setup-required" }, online: true },
  "feature-disabled": { path: "/", roles: [], permissions: [], flags: { beta: false }, session: { state: "active" }, online: true },
};

/**
 * Golden demo surface: all nine platform statuses through AppState with
 * starter content only. Feature flags drive the feature-disabled demo.
 */
export default function GoldenStatusWallPage() {
  return (
    <AppPage titleKey="status.wall.title">
      {STATUS_IDS.map((id) => {
        const rules =
          id === "feature-disabled"
            ? [{ scope: "feature" as const, status: id, match: { flags: { beta: false } } }]
            : undefined;
        const resolved = resolveAppState(CONTEXTS[id], rules);
        if (!resolved) return null;
        return (
          <AppState
            key={id}
            variant={resolved.variant}
            titleKey={resolved.titleKey}
            messageKey={resolved.messageKey}
          />
        );
      })}
    </AppPage>
  );
}
