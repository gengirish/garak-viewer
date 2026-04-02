import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("renders header and summary cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Garak Report Viewer");
    const cards = page.locator('[class*="bg-card"][class*="rounded-xl"] >> text=/Total Runs|Models Tested|Total Attempts|Total Hits/');
    await expect(cards.first()).toBeVisible();
  });

  test("displays run list with fixture data", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Llama-3.1-8B-Instruct")).toBeVisible();
    await expect(page.locator("text=huggingface")).toBeVisible();
    await expect(page.locator("text=2 hits")).toBeVisible();
  });

  test("shows correct summary stats", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Total Runs").locator("..").locator("..")).toContainText("1");
    await expect(page.locator("text=Total Hits").locator("..").locator("..")).toContainText("2");
  });

  test("displays actual runs directory from API", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.locator("[class*='font-mono']")).toBeVisible();
    const dirText = await header.locator("[class*='font-mono']").textContent();
    expect(dirText).toContain("garak_runs");
  });

  test("search filters runs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Llama-3.1-8B-Instruct")).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("nonexistent-model-xyz");
    await expect(page.locator("text=Llama-3.1-8B-Instruct")).not.toBeVisible();
    await expect(page.locator('text=/No runs matching/')).toBeVisible();

    await searchInput.clear();
    await expect(page.locator("text=Llama-3.1-8B-Instruct")).toBeVisible();
  });

  test("search by probe spec works", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("xss");
    await expect(page.locator("text=Llama-3.1-8B-Instruct")).toBeVisible();
  });
});

test.describe("Run Detail Page", () => {
  test("navigates to run detail and shows metrics", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Llama-3.1-8B-Instruct");
    await expect(page.locator("div:has-text('Pass Rate')").first()).toBeVisible();
    await expect(page.locator("text=50%").first()).toBeVisible();
  });

  test("shows run config details", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    await expect(page.locator("text=meta-llama/Llama-3.1-8B-Instruct")).toBeVisible();
    await expect(page.locator("text=xss,dan")).toBeVisible();
  });

  test("overview tab shows charts and probe table", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Results by Probe")).toBeVisible();
    await expect(page.locator("text=Overall Pass/Fail")).toBeVisible();
    await expect(page.locator("text=Probe Breakdown")).toBeVisible();

    await expect(page.getByRole("cell", { name: "MarkupInjection" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "DanJailbreak" })).toBeVisible();
  });

  test("hits tab shows hit entries", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    await page.click("text=Hits (2)");
    await expect(page.locator("span:has-text('MarkupInjection')").first()).toBeVisible();
    await expect(page.locator("span:has-text('DanJailbreak')").first()).toBeVisible();
    await expect(page.locator("text=2 hits")).toBeVisible();
  });

  test("hits tab expand shows details", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    await page.click("text=Hits (2)");
    const firstHit = page.locator('[class*="bg-card"][class*="rounded-xl"]').filter({ hasText: "MarkupInjection" }).first();
    await firstHit.locator("button").click();

    await expect(page.locator("text=Goal")).toBeVisible();
    await expect(page.locator("text=Prompt")).toBeVisible();
    await expect(page.locator("text=Model Output")).toBeVisible();
    await expect(page.locator("text=Triggers Matched")).toBeVisible();
  });

  test("attempts tab shows attempts with pagination info", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    await page.click("text=Attempts (4)");
    await expect(page.locator("text=4 results")).toBeVisible();
    await expect(page.locator("select")).toContainText("All probes (4)");
  });

  test("attempts tab filter by pass/fail", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    await page.click("text=Attempts (4)");

    await page.click("button:has-text('Fail')");
    await expect(page.locator("text=2 results")).toBeVisible();

    await page.click("button:has-text('Pass')");
    await expect(page.locator("text=2 results")).toBeVisible();

    await page.click("button:has-text('All')");
    await expect(page.locator("text=4 results")).toBeVisible();
  });

  test("back button returns to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    await page.click("text=Back");
    await page.waitForURL("/");
    await expect(page.locator("h1")).toContainText("Garak Report Viewer");
  });

  test("CSV export button is visible", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    const exportBtn = page.locator("button:has-text('Export CSV')");
    await expect(exportBtn).toBeVisible();
  });

  test("CSV export triggers download", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Llama-3.1-8B-Instruct");
    await page.waitForURL(/\/run\//);

    const downloadPromise = page.waitForEvent("download");
    await page.click("button:has-text('Export CSV')");
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^garak-.*-probes\.csv$/);
  });
});

test.describe("API Routes", () => {
  test("GET /api/runs returns runs with runsDir", async ({ request }) => {
    const response = await request.get("/api/runs");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("runs");
    expect(data).toHaveProperty("runsDir");
    expect(Array.isArray(data.runs)).toBe(true);
    expect(data.runs.length).toBe(1);
    expect(data.runs[0].targetName).toBe("meta-llama/Llama-3.1-8B-Instruct");
    expect(data.runs[0].hitCount).toBe(2);
    expect(data.runs[0].totalAttempts).toBe(4);
  });

  test("GET /api/runs/:id returns run detail", async ({ request }) => {
    const response = await request.get("/api/runs/a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.targetName).toBe("meta-llama/Llama-3.1-8B-Instruct");
    expect(data.probeBreakdown).toHaveLength(2);
    expect(data.hits).toHaveLength(2);
    expect(data.attempts).toHaveLength(4);
  });

  test("GET /api/runs/:id returns 404 for unknown run", async ({ request }) => {
    const response = await request.get("/api/runs/nonexistent-id");
    expect(response.status()).toBe(404);
  });
});
