import { chromium } from 'playwright';

async function scan(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for hydration/content
    await page.waitForTimeout(3000);
    
    const listings = await page.evaluate(() => {
      const results = [];
      // Look for common job listing patterns
      const links = Array.from(document.querySelectorAll('a'));
      links.forEach(a => {
        const text = a.innerText.trim();
        const href = a.href;
        if (text.length > 2 && href.startsWith('http')) {
            results.push({ text, href });
        }
      });
      return results;
    });
    
    console.log(JSON.stringify({ url, listings }));
  } catch (err) {
    console.error(JSON.stringify({ url, error: err.message }));
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
if (url) scan(url);
