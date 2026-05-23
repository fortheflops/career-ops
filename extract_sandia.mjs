import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://sandia.jobs/albuquerque-nm/cleared-seniorprincipal-se-project-manager-national-security-space-systems-onsite/FC05E5F26A9846FF895C521C029B976E/job/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const text = await page.innerText('body');
    console.log(text);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
