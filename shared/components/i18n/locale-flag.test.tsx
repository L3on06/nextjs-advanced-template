import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleFlag } from "./locale-flag";

describe("LocaleFlag", () => {
  it("shows the British flag for English", () => {
    const { container } = render(<LocaleFlag locale="en" />);

    const flag = within(container).getByRole("generic", { hidden: true });
    expect(flag.className).toContain("fi-gb");
  });

  it("shows the Albanian flag for Albanian", () => {
    const { container } = render(<LocaleFlag locale="al" />);

    const flag = within(container).getByRole("generic", { hidden: true });
    expect(flag.className).toContain("fi-al");
  });

  it("hides the decorative flag from assistive tech", () => {
    const { container } = render(<LocaleFlag locale="en" />);

    const flag = within(container).getByRole("generic", { hidden: true });
    expect(flag).toHaveAttribute("aria-hidden", "true");
  });
});
