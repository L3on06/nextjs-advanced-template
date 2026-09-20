import { Input } from "@/components/ui/input";
import { cn } from "cn";

/**
 * Starter input. Plain input props plus an optional field error rendered
 * under the control and wired for assistive tech.
 */
export function AppInput({
  fieldError,
  id,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "children"> & { fieldError?: string }) {
  const errorId = id ? `${id}-error` : undefined;
  return (
    <span className="block">
      <Input id={id} className={className} aria-invalid={fieldError ? true : undefined} aria-describedby={errorId} {...props} />
      {fieldError ? (
        <span id={errorId} role="alert" className={cn("mt-1 block text-sm text-destructive")}>
          {fieldError}
        </span>
      ) : null}
    </span>
  );
}
