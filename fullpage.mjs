import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/texas/southlake/christ-our-king-church-southlake', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.playwright-cli/detail-full.png', fullPage: true });
  await browser.close();
})();
