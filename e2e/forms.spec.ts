import { expect, test } from "@playwright/test";

const uniqueEmail = (tag: string) => `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

test.describe("waitlist", () => {
  test("validates, saves, and detects duplicates", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("#waitlist");
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByText("Enter your email address.")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeFocused();

    await page.getByLabel("Email").fill("not-an-email");
    await expect(form.getByText(/Enter a valid email/)).toBeVisible();

    const email = uniqueEmail("wl");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel(/First name/).fill("Ada");
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByRole("heading", { name: "You're on the waitlist, Ada." })).toBeVisible();

    await page.reload();
    await page.getByLabel("Email").fill(email.toUpperCase());
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByRole("heading", { name: "You're already on the list." })).toBeVisible();
  });

  test("hero CTA scrolls to the form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Join the waitlist" }).click();
    await expect(page.getByLabel("Email")).toBeFocused();
    await expect(page.getByLabel("Email")).toBeInViewport();
  });

  test("server rejects invalid input and never fakes success", async ({ request }) => {
    const bad = await request.post("/api/waitlist", { data: { email: "nope" } });
    expect(bad.status()).toBe(400);
    const click = await request.post("/api/events", { data: { name: "waitlist_signup" } });
    expect(click.status()).toBe(400); // conversions can only be recorded server-side
  });
});

test.describe("reservation", () => {
  test("shows price first, requires acknowledgement, saves, and detects duplicates", async ({ page }) => {
    const email = uniqueEmail("rs");
    // Same email joins the waitlist first: the two records are independent.
    const wl = await page.request.post("/api/waitlist", { data: { email } });
    expect(wl.status()).toBe(201);

    await page.goto("/reserve");
    const price = await page.getByTestId("proposed-price").textContent();
    expect(price).toMatch(/^\$\d/);

    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Reserve my spot" }).click();
    await expect(page.getByText(/Please confirm you understand/)).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeFocused();

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Reserve my spot" }).click();
    await expect(page.getByRole("heading", { name: "Your spot is reserved." })).toBeVisible();
    await expect(page.getByRole("status")).toContainText(price!);

    await page.reload();
    await page.getByLabel("Email").fill(email);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Reserve my spot" }).click();
    await expect(page.getByRole("heading", { name: "You've already reserved a spot." })).toBeVisible();
  });

  test("rejects a stale price", async ({ request }) => {
    const res = await request.post("/api/reserve", {
      data: { email: uniqueEmail("stale"), acknowledged: true, priceCents: 1, priceVersion: "old" },
    });
    expect(res.status()).toBe(409);
    expect((await res.json()).code).toBe("price_changed");
  });
});

test("no page scrolls horizontally", async ({ page }) => {
  for (const path of ["/", "/app", "/reserve"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
