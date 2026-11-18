import { expect, test, type Page } from "@playwright/test";

const dot = (page: Page, i: number) => page.getByTestId("pillow-3d").locator("xpath=..").locator("span.size-3").nth(i);

/** The dot's on-screen position, from the translate the frame loop writes. */
async function dotPosition(page: Page, i: number) {
  const transform = await dot(page, i).evaluate((el) => (el as HTMLElement).style.transform);
  const [, x, y] = transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/) ?? [];
  return { x: Number(x), y: Number(y) };
}

test("3D pillow spins and the callouts stay pinned to it", async ({ page, isMobile }) => {
  test.skip(isMobile, "Callout chips are a desktop overlay; mobile shows a list instead.");
  await page.goto("/");
  const stage = page.getByTestId("pillow-3d");
  await expect(stage.locator("canvas")).toBeAttached({ timeout: 15_000 });
  await expect(stage.locator("xpath=..").getByText("Wave audio", { exact: true })).toBeVisible();

  // At rest every anchor faces the camera, and each line ends on its dot.
  await expect.poll(async () => Number(await dot(page, 0).evaluate((el) => (el as HTMLElement).style.opacity))).toBeGreaterThan(0.9);
  const before = await dotPosition(page, 0);
  const line = page.locator("svg line").first();
  expect(Number(await line.getAttribute("x2"))).toBeCloseTo(before.x, 0);

  // Spinning moves the anchor with the pillow…
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Math.abs((await dotPosition(page, 0)).x - before.x)).toBeGreaterThan(15);

  // …and once the front face turns away, the dots and lines fade out.
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await dot(page, 0).evaluate((el) => (el as HTMLElement).style.opacity))).toBeLessThan(0.1);
  await expect.poll(async () => Number(await line.evaluate((el) => (el as SVGLineElement).style.opacity))).toBeLessThan(0.1);
});

test("small screens list the pillow features", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout only.");
  await page.goto("/");
  const list = page.getByRole("list", { name: "Pillow features" });
  await expect(list.getByText("App lock")).toBeVisible();
});
