import { remote } from "webdriverio";

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
    console.log("Performing swipe up gesture...");
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
    console.log("Performing swipe down gesture...");
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
    console.log("Performing swipe left gesture...");
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
    console.log("Performing swipe right gesture...");
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
    console.log("Performing pinch zoom out gesture...");
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
    console.log("Performing long press gesture...");
    const { width, height } = await this.driver.getWindowSize();

    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height / 2 } },
      { action: "wait", options: { ms: 2000 } },
      { action: "release" },
    ]);
    await this.driver.pause(1000);
  }

  async doubleTap() {
    console.log("Performing double tap gesture...");
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
    console.log("Demonstrating scroll to find element...");

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
            console.log("Found Settings app!");
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
        console.log("Settings app not found after scrolling");
      }
    } catch (error) {
      console.log("Scroll to element demo failed:", error.message);
    }
  }
}

(async () => {
  let driver;

  try {
    console.log("Starting gesture automation demo...");

    driver = await remote({
      hostname: "localhost",
      port: 4723,
      path: "/",
      logLevel: "info",
      capabilities: caps,
    });

    console.log("Connected successfully");

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
    console.log("Opening app drawer...");
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

    console.log("Gesture demo completed successfully!");
  } catch (error) {
    console.error("Gesture demo error:", error.message);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
