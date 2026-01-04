// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PersonalBench Integration Tests', () => {
  test('should run all tests successfully', async ({ page }) => {
    // Navigate to test runner
    await page.goto('/test-runner.html');

    // Wait for page to load
    await page.waitForSelector('#run-all-tests');

    // Click "Run All Tests" button
    await page.click('#run-all-tests');

    // Wait for tests to complete by looking for the summary message
    // The test runner logs "📊 Test Results:" when done
    await page.waitForFunction(() => {
      const output = document.getElementById('console-output');
      return output && output.textContent.includes('📊 Test Results:');
    }, { timeout: 60000 });

    // Give a moment for final logs to be captured
    await page.waitForTimeout(1000);

    // Get the console output
    const consoleOutput = await page.locator('#console-output').textContent();

    // Check for failures
    const failureMatch = consoleOutput.match(/(\d+) failed/);
    const failureCount = failureMatch ? parseInt(failureMatch[1]) : 0;

    // Check for passes
    const passMatch = consoleOutput.match(/(\d+) passed/);
    const passCount = passMatch ? parseInt(passMatch[1]) : 0;

    // Log the results
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log('\n=== Console Output ===');
    console.log(consoleOutput);

    // Assert no failures
    expect(failureCount).toBe(0);

    // Assert we actually ran some tests
    expect(passCount).toBeGreaterThan(0);
  });

  test('should run UI tests successfully', async ({ page }) => {
    await page.goto('/test-runner.html');
    await page.waitForSelector('#run-ui-tests');

    await page.click('#run-ui-tests');

    await page.waitForFunction(() => {
      const output = document.getElementById('console-output');
      return output && output.textContent.includes('📊 Test Results:');
    }, { timeout: 30000 });

    await page.waitForTimeout(1000);

    const consoleOutput = await page.locator('#console-output').textContent();

    const failureMatch = consoleOutput.match(/(\d+) failed/);
    const failureCount = failureMatch ? parseInt(failureMatch[1]) : 0;

    const passMatch = consoleOutput.match(/(\d+) passed/);
    const passCount = passMatch ? parseInt(passMatch[1]) : 0;

    console.log('\n=== UI Test Results ===');
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failureCount}`);

    expect(failureCount).toBe(0);
    expect(passCount).toBeGreaterThan(0);
  });

  test('should run E2E tests successfully', async ({ page }) => {
    await page.goto('/test-runner.html');
    await page.waitForSelector('#run-e2e-tests');

    await page.click('#run-e2e-tests');

    await page.waitForFunction(() => {
      const output = document.getElementById('console-output');
      return output && output.textContent.includes('📊 Test Results:');
    }, { timeout: 30000 });

    await page.waitForTimeout(1000);

    const consoleOutput = await page.locator('#console-output').textContent();

    const failureMatch = consoleOutput.match(/(\d+) failed/);
    const failureCount = failureMatch ? parseInt(failureMatch[1]) : 0;

    const passMatch = consoleOutput.match(/(\d+) passed/);
    const passCount = passMatch ? parseInt(passMatch[1]) : 0;

    console.log('\n=== E2E Test Results ===');
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failureCount}`);

    expect(failureCount).toBe(0);
    expect(passCount).toBeGreaterThan(0);
  });
});
