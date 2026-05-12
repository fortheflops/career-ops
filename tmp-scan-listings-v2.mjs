import { chromium } from 'playwright';

async function scan(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    
    // Specifically wait for Ashby/Lever/Greenhouse patterns
    await page.waitForTimeout(5000);
    
    // Scroll to trigger lazy loading
    await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(r => setTimeout(r, 500));
        }
    });

    const listings = await page.evaluate(() => {
      const results = [];
      // Look for links that look like jobs
      const links = Array.from(document.querySelectorAll('a'));
      links.forEach(a => {
        const text = a.innerText.replace(/\s+/g, ' ').trim();
        const href = a.href;
        // Ashby usually has /anduril/6141111003 or similar
        // Lever has /shieldai/6141111003
        // Greenhouse has /rocketlab/jobs/6141111003
        const isJobLink = href.includes('/jobs/') || href.includes('/posting/') || (href.split('/').length > 4 && /\d+/.test(href));
        if (text.length > 5 && isJobLink) {
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
