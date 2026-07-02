import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    await page.goto('http://localhost:5179', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Login
    await page.type('input[type="text"]', 'admin', { delay: 20 });
    await page.type('input[type="password"]', 'admin123', { delay: 20 });
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await sleep(2000);

    // Hide error dialog
    await page.evaluate(() => {
      document.querySelector('.swal2-backdrop-show')?.remove();
      document.querySelector('.swal2-container')?.remove();
    });
    await sleep(500);

    // Click hamburger to collapse sidebar
    const hamburger = await page.$('[id="vertical-hover"], button.header-item');
    if (hamburger) {
      console.log('Collapsing sidebar...');
      await hamburger.click();
      await sleep(1000);
    }

    // Get the current sidebar state
    const isCollapsed = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-sidebar-size') === 'sm';
    });
    console.log('Sidebar collapsed:', isCollapsed);

    // Hover over first menu icon in the collapsed sidebar
    if (isCollapsed) {
      await page.evaluate(() => {
        const links = document.querySelectorAll('a.nav-link.menu-link');
        if (links.length > 0) {
          const link = links[0];
          const e = new MouseEvent('mouseenter', { bubbles: true });
          link.dispatchEvent(e);
        }
      });
      console.log('Hovering menu link...');
      await sleep(1500);
    }

    const screenshotPath = path.join(__dirname, 'sidebar-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot: ${screenshotPath}`);

  } catch (e) {
    console.error(e.message);
  } finally {
    if (browser) await browser.close();
  }
})();
