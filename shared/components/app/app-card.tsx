import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";

/** Starter card. Translated title plus optional action plus content. */
export function AppCard({
  titleKey,
  action,
  children,
}: {
  titleKey: TranslationKey;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <T k={titleKey} />
        </CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
