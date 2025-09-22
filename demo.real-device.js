import { remote } from "webdriverio";

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
    console.log("Connecting to real Android device...");

    // Check if device is connected
    const { execSync } = await import("child_process");
    const devices = execSync("adb devices").toString();
    console.log("Connected devices:", devices);

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

    console.log("Successfully connected to real device");

    // Get device information
    const deviceInfo = await driver.execute("mobile: deviceInfo");
    console.log("Device Info:", JSON.stringify(deviceInfo, null, 2));

    // Get battery information
    const batteryInfo = await driver.execute("mobile: batteryInfo");
    console.log("Battery Level:", batteryInfo.level + "%");
    console.log("Battery State:", batteryInfo.state);

    // Test device sensors if available
    try {
      const networkInfo = await driver.execute("mobile: shell", {
        command: "dumpsys",
        args: ["connectivity"],
      });
      console.log("Network connectivity check completed");
    } catch (sensorError) {
      console.log("Sensor check skipped:", sensorError.message);
    }

    // Perform real device specific tests
    console.log("Testing device-specific features...");

    // Test camera permission (if available)
    try {
      await driver.execute("mobile: shell", {
        command: "am",
        args: ["start", "-a", "android.media.action.IMAGE_CAPTURE"],
      });
      await driver.pause(2000);
      await driver.pressKeyCode(4); // Back button
      console.log("Camera app test completed");
    } catch (cameraError) {
      console.log("Camera test skipped:", cameraError.message);
    }

    // Test notifications
    await driver.execute("mobile: shell", {
      command: "am",
      args: ["broadcast", "-a", "android.intent.action.CLOSE_SYSTEM_DIALOGS"],
    });

    console.log("Real device demo completed successfully!");
  } catch (error) {
    console.error("Real device demo error:", error.message);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
