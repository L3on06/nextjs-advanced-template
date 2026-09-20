"use client";

import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_META } from "@/shared/i18n/settings";
import { useChangeLocale, useLocale, useT } from "./i18n-provider";
import { LocaleFlag } from "./locale-flag";

/** Language dropdown with flags. Locales come from settings, nothing hardcoded. */
export function LanguageSwitcher({ align = "end" }: { align?: "start" | "end" }) {
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const { t } = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        aria-label={t("language")}
      >
        <LocaleFlag locale={locale} />
        <span className="uppercase">{locale}</span>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
          {LOCALES.map((option) => {
          const active = option === locale;
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                if (!active) changeLocale(option);
              }}
            >
              <LocaleFlag locale={option} />
              <span>{LOCALE_META[option].label}</span>
              {active && <Check className="ml-auto" />}
            </DropdownMenuItem>
          );
        })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
