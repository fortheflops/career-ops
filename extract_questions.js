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
    } else {
      console.log('Apply button not found or already on application page.');
    }

    // Wait for the form to appear. Usually, job boards take some time.
    await page.waitForTimeout(5000);

    console.log('Extracting questions...');
    
    // Common patterns for questions in application forms: labels, input placeholders, or specific question divs.
    const questions = await page.evaluate(() => {
      const selectors = [
        'label', 
        '.question-label', 
        '.form-label', 
        '[id*="question"]', 
        '.field-label'
      ];
      
      const found = [];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.innerText.trim();
          if (text && text.length > 2) {
            found.push(text);
          }
        });
      });
      
      return [...new Set(found)]; // Remove duplicates
    });

    if (questions.length === 0) {
      // Try a more aggressive approach if labels didn't work
      const allText = await page.innerText('body');
      console.log('No labels found. Dumping body text to help identify form structure.');
      console.log('--- BODY START ---');
      console.log(allText);
      console.log('--- BODY END ---');
    } else {
      console.log('Questions found:');
      questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    }

  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
})();
