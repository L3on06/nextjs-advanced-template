import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Button } from "@/components/ui/button";

/** Starter button. Same props as the shadcn primitive, one name for features. */
export function AppButton(props: ButtonPrimitive.Props) {
  return <Button {...props} />;
}
