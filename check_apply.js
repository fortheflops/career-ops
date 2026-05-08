const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to job detail page...');
    await page.goto('https://careers.boozallen.com/jobs/JobDetail/Albuquerque-Business-Analyst-Mid-R0233850/121094', { waitUntil: 'networkidle' });

    const applyButton = await page.locator('text=Apply').first();
    if (await applyButton.isVisible()) {
      console.log('Clicking Apply button...');
      await applyButton.click();
      await page.waitForLoadState('networkidle');
      console.log('Current URL after clicking Apply:', page.url());
    } else {
      console.log('Apply button not found.');
    }

    await page.waitForTimeout(5000);
    const content = await page.innerText('body');
    if (content.includes('Sign In') || content.includes('Create Account')) {
      console.log('Detected login page.');
    } else {
      console.log('Not a login page. Body contains:');
      console.log(content.substring(0, 500));
    }

  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
})();
