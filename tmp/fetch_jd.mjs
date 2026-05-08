import { chromium } from 'playwright';
import process from 'process';

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('Please provide a URL');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const content = await page.innerText('body');
    console.log(content);
  } catch (error) {
    console.error('Error fetching page:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
