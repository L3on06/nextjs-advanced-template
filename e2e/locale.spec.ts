import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("home renders in English with the matching document language", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Welcome" }),
  ).toBeVisible();
  await expect(page.getByText("Hello, Leon!")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("prefixed URLs render their own content", async ({ page }) => {
  await page.goto("/al");

  await expect(
    page.getByRole("heading", { name: "Mirë se vini" }),
  ).toBeVisible();
  await expect(page.getByText("Përshëndetje, Leon!")).toBeVisible();

  await page.goto("/en");

  await expect(
    page.getByRole("heading", { name: "Welcome" }),
  ).toBeVisible();
});

test("a prefixed page sets the document language to its locale", async ({
  page,
}) => {
  await page.goto("/al");

  await expect(page.locator("html")).toHaveAttribute("lang", "al");
});

test("the locale cookie decides the home language", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.cookie = "NEXT_LOCALE=al; path=/; max-age=31536000; SameSite=Lax";
  });
  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Mirë se vini" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "al");
});

test("an unknown locale answers not found", async ({ page }) => {
  const response = await page.goto("/fr");

  expect(response?.status()).toBe(404);
});

test("the switcher swaps the language in place", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("menuitem", { name: "Shqip" }).click();

  await expect(
    page.getByRole("heading", { name: "Mirë se vini" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gjuha" }),
  ).toBeVisible();
});
