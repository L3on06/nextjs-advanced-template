import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { AppForm } from "@/components/app/app-form";
import { AppInput } from "@/components/app/app-input";
import { I18nProvider } from "@/components/i18n";

const Schema = z.object({ name: z.string().min(2, "Too short") });

function renderForm(onSubmit: (values: { name: string }) => void) {
  return render(
    <I18nProvider locale="en">
      <AppForm
        schema={Schema}
        values={{ name: "" }}
        onChange={() => {}}
        onSubmit={onSubmit}
        submitKey="action.retry"
        formId="probe"
      >
        {({ field }) => {
          const binding = field("name");
          return <AppInput fieldError={binding.error} {...binding.bind} />;
        }}
      </AppForm>
    </I18nProvider>,
  );
}

describe("AppForm", () => {
  it("blocks submit and shows the first issue per field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
