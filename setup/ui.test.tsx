import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ALL_STEPS } from "@/setup/steps/index";
import { StepForm } from "@/setup/ui";

describe("StepForm", () => {
  it("renders every field of a step and submits values", async () => {
    const user = userEvent.setup();
    const step = ALL_STEPS.find((entry) => entry.id === "emulator");
    const onSubmit = vi.fn();
    render(<StepForm ui={step!.ui} onSubmit={onSubmit} />);
    expect(screen.getByLabelText("Auth port")).toBeInTheDocument();
    expect(screen.getByLabelText("Enable Emulator UI")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders select and multiselect options", () => {
    const step = ALL_STEPS.find((entry) => entry.id === "firebase-auth");
    render(<StepForm ui={step!.ui} onSubmit={() => {}} />);
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("google")).toBeInTheDocument();
  });
});
