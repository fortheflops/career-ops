import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node extract_url.mjs <URL>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give Workday time to render
    const text = await page.innerText('body');
    console.log(text);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
