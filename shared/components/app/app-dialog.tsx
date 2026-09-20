"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";

/**
 * Starter dialog. Controlled only: the caller owns the open flag, so one
 * dialog instance serves a whole table instead of one per row.
 */
export function AppDialog({
  open,
  onOpenChange,
  titleKey,
  descriptionKey,
  children,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <T k={titleKey} />
          </DialogTitle>
          {descriptionKey ? (
            <DialogDescription>
              <T k={descriptionKey} />
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
        {actions ? <DialogFooter>{actions}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
