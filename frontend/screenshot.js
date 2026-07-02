const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    console.log('Navigating to http://localhost:5179...');
    await page.goto('http://localhost:5179', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for sidebar to load
    await page.waitForSelector('[data-sidebar-size], .app-menu', { timeout: 10000 }).catch(() => console.log('Sidebar selector not found, proceeding anyway'));

    // Collapse the sidebar if not already collapsed
    const sidebarToggle = await page.$('[id="vertical-hover"]');
    if (sidebarToggle) {
      console.log('Collapsing sidebar...');
      await sidebarToggle.click();
      await page.waitForTimeout(500); // Let animation settle
    }

    // Hover over the first menu icon to trigger the pill
    const menuIcon = await page.$('a.menu-link');
    if (menuIcon) {
      console.log('Hovering over first menu icon...');
      await menuIcon.hover();
      await page.waitForTimeout(600); // Let pill animation complete
    }

    const screenshotPath = path.join(__dirname, 'sidebar-screenshot.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved: ${screenshotPath}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
