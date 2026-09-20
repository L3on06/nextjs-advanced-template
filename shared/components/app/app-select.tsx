"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";
import { cn } from "cn";

export interface SelectOption {
  value: string;
  labelKey: TranslationKey;
}

/**
 * Starter select. Controlled value plus translated options plus an optional
 * field error. Controlled only: the caller owns the value.
 */
export function AppSelect({
  value,
  onChange,
  options,
  placeholderKey,
  fieldError,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholderKey?: TranslationKey;
  fieldError?: string;
  id?: string;
}) {
  const errorId = id ? `${id}-error` : undefined;
  return (
    <span className="block">
      <Select value={value} onValueChange={(next) => { if (next !== null) onChange(next); }}>
        <SelectTrigger id={id} aria-invalid={fieldError ? true : undefined} aria-describedby={errorId}>
          <SelectValue placeholder={placeholderKey ? <T k={placeholderKey} /> : undefined} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <T k={option.labelKey} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldError ? (
        <span id={errorId} role="alert" className={cn("mt-1 block text-sm text-destructive")}>
          {fieldError}
        </span>
      ) : null}
    </span>
  );
}
