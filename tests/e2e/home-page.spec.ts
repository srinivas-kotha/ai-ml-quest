/**
 * AI/ML Quest — Home Page E2E Tests
 *
 * Skill referenced: playwright-pro (~/claude-dotfiles/claude/skills/playwright-pro/SKILL.md)
 *
 * Covers:
 *  1. Page title loads correctly
 *  2. Hero section is visible
 *  3. Navigation links are functional
 */
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle(/AI\/ML Quest/);
  });

  test("hero section is visible", async ({ page }) => {
    // H1 heading contains "AI/ML Quest"
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("AI/ML");

    // Subtitle paragraph is visible
    const subtitle = page.getByText(
      /doesn.*start at.*what is a neural network/i,
    );
    await expect(subtitle).toBeVisible();
  });

  test("navigation logo links to home", async ({ page }) => {
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Logo link navigates back to home
    const logoLink = nav.getByRole("link").first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await expect(page).toHaveURL("/");
  });

  test("chapters section is reachable via CTA", async ({ page }) => {
    // Primary CTA "Start Free →" links to #chapters anchor
    const cta = page
      .getByRole("link", { name: /start free|view syllabus/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#chapters");
  });

  test("page has no error state", async ({ page }) => {
    // No error heading should appear
    await expect(
      page.getByRole("heading", { name: /error/i }),
    ).not.toBeVisible();
    // Page body is not empty
    await expect(page.locator("main")).toBeVisible();
  });
});
