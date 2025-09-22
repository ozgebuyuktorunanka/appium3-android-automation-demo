import { remote } from "webdriverio";
import { Logger } from "./helpers/logger.js";

//We can initiliaze the logger class.
const logger = new Logger("info");

//Capabilities for Appium 3
const caps = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:NewCommandTimeout": 120,
  "appium:autoGrantPermissions": true,
};

class GestureDemo {
  constructor(driver) {
    this.driver = driver;
  }

  async swipeUp() {
    logger.info("Performing swipe up gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height * 0.8 } },
      { action: "wait", options: { ms: 500 } },
      { action: "moveTo", options: { x: width / 2, y: height * 0.2 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async swipeDown() {
    logger.info("Performing swipe down gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height * 0.2 } },
      { action: "wait", options: { ms: 500 } },
      { action: "moveTo", options: { x: width / 2, y: height * 0.8 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async swipeLeft() {
    logger.info("Performing swipe left gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width * 0.8, y: height / 2 } },
      { action: "wait", options: { ms: 500 } },
      { action: "moveTo", options: { x: width * 0.2, y: height / 2 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async swipeRight() {
    logger.info("Performing swipe right gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width * 0.2, y: height / 2 } },
      { action: "wait", options: { ms: 500 } },
      { action: "moveTo", options: { x: width * 0.8, y: height / 2 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async pinchZoom() {
    logger.info("Performing pinch zoom out gesture...");
    const { width, height } = await this.driver.getWindowSize();
    const centerX = width / 2;
    const centerY = height / 2;

    await this.driver.multiTouchPerform([
      [
        { action: "press", options: { x: centerX - 50, y: centerY - 50 } },
        { action: "moveTo", options: { x: centerX - 100, y: centerY - 100 } },
        { action: "release" },
      ],
      [
        { action: "press", options: { x: centerX + 50, y: centerY + 50 } },
        { action: "moveTo", options: { x: centerX + 100, y: centerY + 100 } },
        { action: "release" },
      ],
    ]);
    await this.driver.pause(1000);
  }

  async longPress() {
    logger.info("Performing long press gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height / 2 } },
      { action: "wait", options: { ms: 2000 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async doubleTap() {
    logger.info("Performing double tap gesture...");
    const { width, height } = await this.driver.getWindowSize();
    const centerX = width / 2;
    const centerY = height / 2;

    await this.driver.touchPerform([
      { action: "press", options: { x: centerX, y: centerY } },
      { action: "release" },
    ]);

    await this.driver.pause(100);

    await this.driver.touchPerform([
      { action: "press", options: { x: centerX, y: centerY } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async scrollToElement() {
    logger.info("Demonstrating scroll to find element...");

    try {
      // Try to find Settings app by scrolling
      let found = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!found && attempts < maxAttempts) {
        try {
          const settingsApp = await this.driver.$(
            '//android.widget.TextView[@text="Settings"]'
          );
          if (await settingsApp.isDisplayed()) {
            logger.info("Found Settings app!");
            await settingsApp.click();
            found = true;

            await this.driver.pause(2000);
            await this.driver.pressKeyCode(4); // Go back
          }
        } catch {
          // Element not found, scroll and try again
          await this.swipeUp();
          attempts++;
        }
      }

      if (!found) {
        logger.info("Settings app not found after scrolling");
      }
    } catch (error) {
      logger.info("Scroll to element demo failed:", error.message);
    }
  }
}

(async () => {
  let driver;

  try {
    logger.info("Starting gesture automation demo...");

    driver = await remote({
      hostname: "localhost",
      port: 4723,
      path: "/",
      logLevel: "info",
      capabilities: caps,
    });

    logger.info("Connected successfully");

    const gestureDemo = new GestureDemo(driver);

    // Go to home screen
    await driver.pressKeyCode(3);
    await driver.pause(2000);

    // Demonstrate various gestures
    await gestureDemo.swipeUp();
    await gestureDemo.swipeDown();
    await gestureDemo.swipeLeft();
    await gestureDemo.swipeRight();

    // Open app drawer for gesture testing
    logger.info("Opening app drawer...");
    const { width, height } = await driver.getWindowSize();
    await driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height - 100 } },
      { action: "moveTo", options: { x: width / 2, y: height / 2 } },
      { action: "release" },
    ]);
    await driver.pause(2000);

    // Test more complex gestures in app drawer
    await gestureDemo.longPress();
    await gestureDemo.doubleTap();
    await gestureDemo.pinchZoom();

    // Try to scroll and find an app
    await gestureDemo.scrollToElement();

    // Return to home
    await driver.pressKeyCode(3);

    logger.info("Gesture demo completed successfully!");
  } catch (error) {
    logger.error("Gesture demo error:", error.message);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
