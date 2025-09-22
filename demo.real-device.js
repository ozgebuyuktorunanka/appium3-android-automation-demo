import { remote } from "webdriverio";
import { Logger } from "./helpers/logger.js";

const logger = new Logger("info");

// Real device capabilities for Appium 3
const caps = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Real Android Device",
  "appium:udid": "auto", // Will auto-detect connected device
  "appium:NewCommandTimeout": 120,
  "appium:autoGrantPermissions": true,
  "appium:noReset": true, // Don't reset app state
  "appium:fullReset": false,
};

(async () => {
  let driver;

  try {
    logger.info("Connecting to real Android device...");

    // Check if device is connected
    const { execSync } = await import("child_process");
    const devices = execSync("adb devices").toString();
    logger.info("Connected devices:", devices);

    if (!devices.includes("device")) {
      throw new Error(
        "No Android device detected. Please connect via USB and enable USB debugging."
      );
    }

    driver = await remote({
      hostname: "localhost",
      port: 4723,
      path: "/",
      logLevel: "info",
      capabilities: caps,
    });

    logger.info("Successfully connected to real device");

    // Get device information
    const deviceInfo = await driver.execute("mobile: deviceInfo");
    logger.info("Device Info:", JSON.stringify(deviceInfo, null, 2));

    // Get battery information
    const batteryInfo = await driver.execute("mobile: batteryInfo");
    logger.info("Battery Level:", batteryInfo.level + "%");
    logger.info("Battery State:", batteryInfo.state);

    // Test device sensors if available
    try {
      const networkInfo = await driver.execute("mobile: shell", {
        command: "dumpsys",
        args: ["connectivity"],
      });
      logger.info("Network connectivity check completed");
    } catch (sensorError) {
      logger.info("Sensor check skipped:", sensorError.message);
    }

    // Perform real device specific tests
    logger.info("Testing device-specific features...");

    // Test camera permission (if available)
    try {
      await driver.execute("mobile: shell", {
        command: "am",
        args: ["start", "-a", "android.media.action.IMAGE_CAPTURE"],
      });
      await driver.pause(2000);
      await driver.pressKeyCode(4); // Back button
      logger.info("Camera app test completed");
    } catch (cameraError) {
      logger.info("Camera test skipped:", cameraError.message);
    }

    // Test notifications
    await driver.execute("mobile: shell", {
      command: "am",
      args: ["broadcast", "-a", "android.intent.action.CLOSE_SYSTEM_DIALOGS"],
    });

    logger.info("Real device demo completed successfully!");
  } catch (error) {
    logger.error("Real device demo error:", error.message);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
