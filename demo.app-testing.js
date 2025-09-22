import { remote } from "webdriverio";
import { Logger } from "./helpers/logger.js";

// App testing capabilities - Chrome browser automation
const caps = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:browserName": "Chrome",
  "appium:NewCommandTimeout": 120,
  "appium:autoGrantPermissions": true,
  "appium:chromedriverExecutable": "/usr/local/bin/chromedriver", // Adjust path as needed
  "appium:noReset": false,
};

(async () => {
  let driver;
  const logger = new Logger("info");

  try {
    logger.info("Starting Chrome browser automation demo...");

    driver = await remote({
      hostname: "localhost",
      port: 4723,
      path: "/",
      logLevel: "info",
      capabilities: caps,
    });

    logger.info("Chrome browser connected successfully");

    // Navigate to a test website
    logger.info("Navigating to Google...");
    await driver.url("https://www.google.com");
    await driver.pause(3000);

    // Get page title
    const title = await driver.getTitle();
    logger.info("Page title:", title);

    // Find search box and perform search
    try {
      const searchBox = await driver.$('input[name="q"]');
      await searchBox.waitForDisplayed({ timeout: 5000 });
      await searchBox.setValue("Appium mobile automation");
      logger.info("Entered search term");

      // Submit search
      await driver.keys("Enter");
      await driver.pause(3000);

      // Check if results are loaded
      const results = await driver.$$("h3");
      logger.info(`Found ${results.length} search results`);

      // Click first result if available
      if (results.length > 0) {
        await results[0].click();
        await driver.pause(3000);

        const newTitle = await driver.getTitle();
        logger.info("Clicked result, new page title:", newTitle);
      }
    } catch (searchError) {
      logger.info("Search interaction failed:", searchError.message);
    }

    // Test mobile responsive behavior
    logger.info("Testing mobile responsive features...");

    // Set mobile viewport
    await driver.setWindowSize(375, 667);
    await driver.pause(1000);

    // Navigate to a mobile-friendly test site
    await driver.url("https://example.com");
    await driver.pause(2000);

    // Take screenshot for mobile view
    const mobileScreenshot = await driver.takeScreenshot();
    logger.info("Mobile screenshot taken");

    // Test scroll behavior
    await driver.execute("window.scrollTo(0, document.body.scrollHeight)");
    await driver.pause(1000);
    await driver.execute("window.scrollTo(0, 0)");

    // Test touch interactions
    const body = await driver.$("body");
    if (await body.isDisplayed()) {
      await driver.touchPerform([
        { action: "press", options: { x: 200, y: 300 } },
        { action: "release" },
      ]);
      logger.info("Touch interaction performed");
    }

    logger.info("Browser automation demo completed!");
  } catch (error) {
    logger.error("Browser automation error:", error.message);
    logger.error("Note: Make sure Chrome browser is installed on the device");
    logger.error("Also ensure chromedriver is properly configured");
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
