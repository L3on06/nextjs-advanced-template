"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { AppButton } from "@/components/app/app-button";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";
import { cn } from "cn";
import type { StatusVariant } from "@/shared/states/status-rules";

export interface StateAction {
  labelKey: TranslationKey;
  href?: string;
  onClick?: () => void;
}

const VARIANT_ICON: Record<StatusVariant, LucideIcon> = {
  loading: Loader2,
  error: AlertCircle,
  warning: TriangleAlert,
  empty: Info,
  success: CheckCircle2,
  info: Info,
};

const VARIANT_TONE: Record<StatusVariant, string> = {
  loading: "text-muted-foreground",
  error: "text-destructive",
  warning: "text-amber-600 dark:text-amber-400",
  empty: "text-muted-foreground",
  success: "text-green-600 dark:text-green-400",
  info: "text-sky-600 dark:text-sky-400",
};

/**
 * The only status view. Variant plus title plus message plus an optional
 * action. No per status components exist outside this file.
 */
export function AppState({
  variant,
  titleKey,
  messageKey,
  action,
  className,
}: {
  variant: StatusVariant;
  titleKey: TranslationKey;
  messageKey?: TranslationKey;
  action?: StateAction;
  className?: string;
}) {
  const Icon = VARIANT_ICON[variant];
  const role = variant === "error" ? "alert" : "status";
  return (
    <div role={role} className={cn("flex flex-col items-center gap-2 py-10 text-center", className)}>
      <Icon aria-hidden className={cn("size-8", VARIANT_TONE[variant], variant === "loading" && "animate-spin")} />
      <p className="text-base font-medium">
        <T k={titleKey} />
      </p>
      {messageKey ? (
        <p className="max-w-md text-sm text-muted-foreground">
          <T k={messageKey} />
        </p>
      ) : null}
      {action ? (
        action.href ? (
          <Link href={action.href} className="mt-2 inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground">
            <T k={action.labelKey} />
          </Link>
        ) : (
          <AppButton type="button" onClick={action.onClick}>
            <T k={action.labelKey} />
          </AppButton>
        )
      ) : null}
    </div>
  );
}
