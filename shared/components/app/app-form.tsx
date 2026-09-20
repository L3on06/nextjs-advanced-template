"use client";

import { useState } from "react";
import { z } from "zod";
import { AppButton } from "@/components/app/app-button";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";

export interface FieldBinding {
  value: string;
  error?: string;
  bind: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    id: string;
  };
}

export interface FormHelpers {
  field: (name: string) => FieldBinding;
}

/**
 * Starter form. Controlled values live with the caller; this component
 * validates on submit with the Zod schema and shows the first issue per
 * field. No async validation in this slice.
 */
export function AppForm<T extends Record<string, string>>({
  schema,
  values,
  onChange,
  onSubmit,
  submitKey,
  children,
  formId,
}: {
  schema: z.ZodType<T>;
  values: T;
  onChange: (values: T) => void;
  onSubmit: (values: T) => void;
  submitKey: TranslationKey;
  children: (helpers: FormHelpers) => React.ReactNode;
  formId: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const field = (name: string): FieldBinding => ({
    value: (values[name] as string) ?? "",
    error: errors[name],
    bind: {
      value: (values[name] as string) ?? "",
      onChange: (event) => {
        onChange({ ...values, [name]: event.target.value });
        setErrors((current) => ({ ...current, [name]: undefined as unknown as string }));
      },
      id: `${formId}-${name}`,
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = schema.safeParse(values);
        if (!parsed.success) {
          const first: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? "");
            if (key && !first[key]) first[key] = issue.message;
          }
          setErrors(first);
          return;
        }
        setErrors({});
        onSubmit(parsed.data);
      }}
    >
      {children({ field })}
      <AppButton type="submit">
        <T k={submitKey} />
      </AppButton>
    </form>
  );
}
