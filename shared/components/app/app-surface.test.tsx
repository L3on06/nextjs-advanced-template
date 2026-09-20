import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppTable, type Column } from "@/components/app/app-table";
import { AppPage } from "@/components/app/app-page";
import { AppState } from "@/components/app/app-state";
import { I18nProvider } from "@/components/i18n";

type Row = { id: string; name: string };
const COLUMNS: Column<Row>[] = [{ key: "name", headerKey: "welcome" }];

function renderWithLocale(ui: React.ReactNode) {
  return render(<I18nProvider locale="en">{ui}</I18nProvider>);
}

describe("AppTable", () => {
  it("renders rows with typed columns", () => {
    renderWithLocale(<AppTable columns={COLUMNS} rows={[{ id: "1", name: "Ada" }]} rowKey="id" emptyKey="status_empty_title" />);
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("renders the empty state when rows are absent", () => {
    renderWithLocale(<AppTable columns={COLUMNS} rows={[]} rowKey="id" emptyKey="status_empty_title" />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders skeleton rows apart from empty while loading", () => {
    renderWithLocale(<AppTable columns={COLUMNS} rows={[]} rowKey="id" emptyKey="status_empty_title" isLoading />);
    expect(screen.getAllByLabelText("loading")).toHaveLength(3);
    expect(screen.queryByText("Nothing here yet")).not.toBeInTheDocument();
  });
});

describe("AppPage", () => {
  it("replaces content with the state node when present", () => {
    renderWithLocale(
      <AppPage
        titleKey="welcome"
        state={<AppState variant="empty" titleKey="status_empty_title" />}
      >
        <p>page body</p>
      </AppPage>,
    );
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(screen.queryByText("page body")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
