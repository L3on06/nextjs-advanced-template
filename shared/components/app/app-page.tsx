import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";

/**
 * Starter page shell. Title plus actions plus content plus an optional state
 * node. Fetches no data: when the state node is present it replaces the
 * content entirely.
 */
export function AppPage({
  titleKey,
  actions,
  state,
  children,
}: {
  titleKey: TranslationKey;
  actions?: React.ReactNode;
  state?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          <T k={titleKey} />
        </h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {state ?? children}
    </main>
  );
}
