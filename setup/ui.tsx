"use client";

import { useState } from "react";
import type { StepUI, UiField } from "./types";

/**
 * Generic wizard renderer. Every step declares its UI as data (fields bound
 * to schema keys); this one component renders all 25 steps. No per step JSX
 * exists anywhere, so a new step cannot forget its UI.
 */

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: UiField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `setup-${field.name}`;
  switch (field.type) {
    case "text":
      return <input id={id} type="text" value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />;
    case "secret":
      return <input id={id} type="password" autoComplete="off" value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />;
    case "number":
      return <input id={id} type="number" value={(value as number) ?? ""} onChange={(event) => onChange(Number(event.target.value))} />;
    case "boolean":
      return <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
    case "select":
      return (
        <select id={id} value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    case "multiselect": {
      const selected = new Set((value as string[]) ?? []);
      return (
        <fieldset>
          {(field.options ?? []).map((option) => (
            <label key={option} htmlFor={`${id}-${option}`}>
              <input
                id={`${id}-${option}`}
                type="checkbox"
                checked={selected.has(option)}
                onChange={() => {
                  const next = new Set(selected);
                  if (next.has(option)) next.delete(option);
                  else next.add(option);
                  onChange([...next]);
                }}
              />
              {option}
            </label>
          ))}
        </fieldset>
      );
    }
  }
}

export function StepForm({
  ui,
  initialValues = {},
  onSubmit,
}: {
  ui: StepUI;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  return (
    <form
      aria-label={ui.title}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <h2>{ui.title}</h2>
      <p>{ui.description}</p>
      {ui.fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`setup-${field.name}`}>{field.label}</label>
          <FieldInput
            field={field}
            value={values[field.name]}
            onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
          />
          {field.help ? <small>{field.help}</small> : null}
        </div>
      ))}
      <button type="submit">Continue</button>
    </form>
  );
}
