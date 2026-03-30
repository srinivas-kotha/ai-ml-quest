import { test, expect } from "@playwright/test";

test("homepage loads and has a title element", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
