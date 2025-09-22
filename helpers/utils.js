import { Logger } from "./logger.js";

const logger = new Logger("info");

export class AppiumUtils {
  constructor(driver) {
    this.driver = driver;
  }

  // Wait for element with custom timeout
  async waitForElement(selector, timeout = 10000) {
    try {
      const element = await this.driver.$(selector);
      await element.waitForDisplayed({ timeout });
      return element;
    } catch (error) {
      logger.error(`Element not found: ${selector}`);
      throw error;
    }
  }

  // Safe click with existence check
  async safeClick(selector, timeout = 5000) {
    try {
      const element = await this.waitForElement(selector, timeout);
      await element.click();
      logger.info(`Successfully clicked: ${selector}`);
      return true;
    } catch (error) {
      logger.error(`Safe click failed: ${selector} - ${error.message}`);
      return false;
    }
  }

  // Safe text input
  async safeSetValue(selector, text, timeout = 5000) {
    try {
      const element = await this.waitForElement(selector, timeout);
      await element.clearValue();
      await element.setValue(text);
      logger.info(`Successfully set value "${text}" to: ${selector}`);
      return true;
    } catch (error) {
      logger.error(`Safe set value failed: ${selector} - ${error.message}`);
      return false;
    }
  }

  // Get text with fallback
  async safeGetText(selector, defaultText = "", timeout = 5000) {
    try {
      const element = await this.waitForElement(selector, timeout);
      const text = await element.getText();
      return text || defaultText;
    } catch (error) {
      logger.error(`Get text failed: ${selector} - ${error.message}`);
      return defaultText;
    }
  }

  // Smart scroll to find element
  async scrollToElement(selector, maxScrolls = 5, direction = "down") {
    let scrollCount = 0;
    const { width, height } = await this.driver.getWindowSize();

    while (scrollCount < maxScrolls) {
      try {
        const element = await this.driver.$(selector);
        if (await element.isDisplayed()) {
          logger.info(
            `Found element after ${scrollCount} scrolls: ${selector}`
          );
          return element;
        }
      } catch (error) {
        logger.error("Element not found, continue scrolling.");
      }

      // Perform scroll based on direction
      if (direction === "down") {
        await this.scrollDown();
      } else if (direction === "up") {
        await this.scrollUp();
      }

      scrollCount++;
      await this.driver.pause(1000);
    }

    throw new Error(
      `Element not found after ${maxScrolls} scrolls: ${selector}`
    );
  }

  // Scroll down
  async scrollDown() {
    const { width, height } = await this.driver.getWindowSize();
    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height * 0.8 } },
      { action: "moveTo", options: { x: width / 2, y: height * 0.2 } },
      { action: "release" },
    ]);
  }

  // Scroll up
  async scrollUp() {
    const { width, height } = await this.driver.getWindowSize();
    await this.driver.touchPerform([
      { action: "press", options: { x: width / 2, y: height * 0.2 } },
      { action: "moveTo", options: { x: width / 2, y: height * 0.8 } },
      { action: "release" },
    ]);
  }

  // Take screenshot with timestamp
  async takeTimestampedScreenshot(filename = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotName = filename || `screenshot-${timestamp}`;

    try {
      const screenshot = await this.driver.takeScreenshot();

      // Save to file if needed
      if (filename) {
        const fs = await import("fs/promises");
        await fs.mkdir("screenshots", { recursive: true });
        await fs.writeFile(
          `screenshots/${screenshotName}.png`,
          screenshot,
          "base64"
        );
        logger.info(`Screenshot saved: screenshots/${screenshotName}.png`);
      }

      return screenshot;
    } catch (error) {
      logger.error(`Screenshot failed: ${error.message}`);
      return null;
    }
  }

  // Wait for page to load
  async waitForPageLoad(timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // Check if page is interactive by looking for any clickable element
        const elements = await this.driver.$(
          "//android.widget.Button | //android.widget.TextView | //android.widget.ImageView"
        );
        if (elements.length > 0) {
          logger.info("Page loaded successfully");
          return true;
        }
      } catch (error) {
        logger.error("Continue waiting.");
      }

      await this.driver.pause(500);
    }
    logger.info("Page load timeout reached");
    return false;
  }

  // Get device orientation
  async getOrientation() {
    try {
      const orientation = await this.driver.getOrientation();
      logger.info(`Current orientation: ${orientation}`);
      return orientation;
    } catch (error) {
      logger.error(`Get orientation failed: ${error.message}`);
      return null;
    }
  }

  // Rotate device
  async rotateDevice(orientation = "LANDSCAPE") {
    try {
      await this.driver.setOrientation(orientation);
      await this.driver.pause(2000); // Wait for rotation to complete
      logger.info(`Device rotated to: ${orientation}`);
      return true;
    } catch (error) {
      logger.error(`Rotation failed: ${error.message}`);
      return false;
    }
  }

  // Check if app is installed
  async isAppInstalled(packageName) {
    try {
      const result = await this.driver.execute("mobile: shell", {
        command: "pm",
        args: ["list", "packages", packageName],
      });

      const isInstalled = result.includes(packageName);
      logger.info(
        `App ${packageName} ${isInstalled ? "is" : "is not"} installed`
      );
      return isInstalled;
    } catch (error) {
      logger.error(`Check app installation failed: ${error.message}`);
      return false;
    }
  }

  // Launch app by package name
  async launchApp(packageName, activityName = null) {
    try {
      if (activityName) {
        await this.driver.execute("mobile: shell", {
          command: "am",
          args: ["start", "-n", `${packageName}/${activityName}`],
        });
      } else {
        await this.driver.execute("mobile: shell", {
          command: "monkey",
          args: ["-p", packageName, "1"],
        });
      }

      await this.driver.pause(3000);
      logger.info(`Launched app: ${packageName}`);
      return true;
    } catch (error) {
      logger.error(`Launch app failed: ${error.message}`);
      return false;
    }
  }

  // Close app
  async closeApp(packageName) {
    try {
      await this.driver.execute("mobile: shell", {
        command: "am",
        args: ["force-stop", packageName],
      });
      logger.info(`Closed app: ${packageName}`);
      return true;
    } catch (error) {
      logger.error(`Close app failed: ${error.message}`);
      return false;
    }
  }

  // Clear app data
  async clearAppData(packageName) {
    try {
      await this.driver.execute("mobile: shell", {
        command: "pm",
        args: ["clear", packageName],
      });
      logger.info(`Cleared data for app: ${packageName}`);
      return true;
    } catch (error) {
      logger.error(`Clear app data failed: ${error.message}`);
      return false;
    }
  }

  // Get network info
  async getNetworkInfo() {
    try {
      const networkData = await this.driver.execute("mobile: shell", {
        command: "dumpsys",
        args: ["connectivity"],
      });

      // Parse basic connectivity info
      const isConnected =
        networkData.includes("NetworkInfo: type: WIFI") ||
        networkData.includes("NetworkInfo: type: MOBILE");

      return {
        connected: isConnected,
        rawData: networkData.substring(0, 500), // First 500 chars for preview
      };
    } catch (error) {
      logger.error(`Get network info failed: ${error.message}`);
      return { connected: false, rawData: null };
    }
  }

  // Enable/disable WiFi
  async toggleWifi(enable = true) {
    try {
      const action = enable ? "enable" : "disable";
      await this.driver.execute("mobile: shell", {
        command: "svc",
        args: ["wifi", action],
      });

      await this.driver.pause(2000);
      logger.info(`WiFi ${action}d`);
      return true;
    } catch (error) {
      logger.error(`WiFi toggle failed: ${error.message}`);
      return false;
    }
  }

  // Get current activity
  async getCurrentActivity() {
    try {
      const activity = await this.driver.getCurrentActivity();
      logger.info(`Current activity: ${activity}`);
      return activity;
    } catch (error) {
      logger.error(`Get current activity failed: ${error.message}`);
      return null;
    }
  }

  // Wait with custom condition
  async waitUntil(conditionFn, timeout = 10000, interval = 1000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await conditionFn();
        if (result) {
          return true;
        }
      } catch (error) {
        logger.warn("Continue waiting");
      }
      await this.driver.pause(interval);
    }

    throw new Error(`Wait condition timeout after ${timeout}ms`);
  }

  // Execute shell command safely
  async executeShell(command, args = []) {
    try {
      const result = await this.driver.execute("mobile: shell", {
        command,
        args,
      });
      logger.info(`Shell command executed: ${command} ${args.join(" ")}`);
      return result;
    } catch (error) {
      logger.error(`Shell command failed: ${command} - ${error.message}`);
      return null;
    }
  }
}
