import { expect, test, type Page } from "@playwright/test";

const phone = (page: Page) => page.getByRole("region", { name: "SleepPillow app prototype" });
const tab = (page: Page, name: string) => phone(page).getByRole("navigation", { name: "App" }).getByRole("button", { name });

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto("/app");
  await page.evaluate(() => localStorage.removeItem("sp.demo.v1"));
  await page.reload();
  await expect(phone(page).getByTestId("timer")).toContainText("20:00");
  // Freeze time: from here on it only moves when a test fast-forwards it.
  await page.clock.pauseAt(new Date(Date.now() + 10_000));
});

test("timer begins, pauses, survives tab switches, resumes, and completes", async ({ page }) => {
  const p = phone(page);
  await p.getByRole("button", { name: "Begin wind-down" }).click();
  await page.clock.fastForward(65_000);
  await expect(p.getByTestId("timer")).toContainText("18:55");

  await p.getByRole("button", { name: "Pause" }).click();
  await page.clock.fastForward(30_000);
  await expect(p.getByTestId("timer")).toContainText("18:55");

  await p.getByRole("button", { name: "Resume" }).click();
  await tab(page, "Sounds").click();
  await page.clock.fastForward(60_000);
  await tab(page, "Tonight").click();
  await expect(p.getByTestId("timer")).toContainText("17:55");

  await page.clock.fastForward(18 * 60_000);
  await expect(p.getByRole("heading", { name: "Wind-down complete." })).toBeVisible();
  await p.getByRole("button", { name: "Done" }).click();
  await expect(p.getByRole("button", { name: "Begin wind-down" })).toBeVisible();
});

test("end session returns to idle", async ({ page }) => {
  const p = phone(page);
  await p.getByRole("button", { name: "Begin wind-down" }).click();
  await expect(p.getByRole("heading", { name: "Your pillow right now" })).toBeVisible();
  await p.getByRole("button", { name: "End" }).click();
  await expect(p.getByTestId("timer")).toContainText("20:00");
});

test("routine changes save, update Tonight, and persist across reloads", async ({ page }) => {
  const p = phone(page);
  await p.getByRole("button", { name: "Adjust routine" }).click();
  await expect(p.getByRole("heading", { name: "Routine" })).toBeVisible();

  await p.getByText("10 min", { exact: true }).click();
  await p.locator("label", { hasText: /^Cool$/ }).click();
  await p.getByRole("button", { name: "Change bedtime" }).click();
  const sheet = p.getByRole("dialog", { name: "Bedtime" });
  await sheet.getByRole("button", { name: "11:00 PM" }).click();
  await sheet.getByRole("button", { name: "Done" }).click();

  await p.getByRole("button", { name: "Save routine" }).click();
  await expect(p.getByText("Routine saved · Tonight is updated")).toBeVisible();
  await expect(p.getByRole("button", { name: "Routine saved" })).toBeVisible();

  await tab(page, "Tonight").click();
  await expect(p.getByTestId("timer")).toContainText("10:00");
  await expect(p.getByRole("button", { name: "Cooling: Cool. Change" })).toBeVisible();
  await expect(p.getByText("11:00 PM · 10 min")).toBeVisible();

  await page.reload();
  await expect(phone(page).getByTestId("timer")).toContainText("10:00");
});

test("sheets open inside the phone screen", async ({ page }) => {
  const p = phone(page);
  await p.getByRole("button", { name: /^Haptics: Gentle/ }).click();
  const dialog = p.getByRole("dialog", { name: "Haptics" });
  await expect(dialog).toBeVisible();
  const [d, ph] = [await dialog.boundingBox(), await p.boundingBox()];
  expect(d!.x).toBeGreaterThanOrEqual(ph!.x);
  expect(d!.x + d!.width).toBeLessThanOrEqual(ph!.x + ph!.width + 1);
  expect(d!.y + d!.height).toBeLessThanOrEqual(ph!.y + ph!.height + 1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await p.getByRole("button", { name: /^Haptics: Gentle/ }).click();
  await p.getByRole("radio", { name: /Medium/ }).click();
  await expect(p.getByRole("button", { name: /^Haptics: Medium/ })).toBeVisible();
});

test("sound previews: one at a time, selection updates Tonight", async ({ page }) => {
  const p = phone(page);
  await tab(page, "Sounds").click();
  await p.getByRole("button", { name: "Play Ocean preview" }).click();
  await expect(p.getByRole("button", { name: "Pause Ocean preview" })).toBeVisible();
  await p.getByRole("button", { name: "Play Rain preview" }).click();
  await expect(p.getByRole("button", { name: "Pause Rain preview" })).toBeVisible();
  await expect(p.getByRole("button", { name: "Play Ocean preview" })).toBeVisible();
  await p.getByRole("button", { name: "Pause Rain preview" }).click();
  await expect(p.getByRole("button", { name: "Play Rain preview" })).toBeVisible();

  await p.getByRole("radio", { name: /Night breeze/ }).click();
  await p.getByLabel("Volume").fill("30");
  await tab(page, "Tonight").click();
  await expect(p.getByRole("button", { name: "Wave audio: Night breeze. Change" })).toBeVisible();
});

test("simulated pillow connection and demo reset", async ({ page }) => {
  const p = phone(page);
  await p.getByRole("button", { name: /Pillow connected/ }).click();
  await expect(p.getByTestId("connection-status")).toContainText("Connected (simulated)");
  await p.getByRole("button", { name: "Disconnect pillow" }).click();
  await expect(p.getByTestId("connection-status")).toContainText("Not connected");
  await p.getByRole("button", { name: "Connect simulated pillow" }).click();
  await expect(p.getByTestId("connection-status")).toContainText("Connecting");
  await page.clock.fastForward(2000);
  await expect(p.getByTestId("connection-status")).toContainText("Connected (simulated)");

  await p.getByRole("button", { name: "Reset demo" }).click();
  const dialog = p.getByRole("dialog", { name: "Reset the demo?" });
  await dialog.getByRole("button", { name: "Reset" }).click();
  await expect(p.getByText("Demo reset to defaults")).toBeVisible();
  await expect(p.getByTestId("timer")).toContainText("20:00");
});
