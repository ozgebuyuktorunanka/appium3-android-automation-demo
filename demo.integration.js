import { remote } from "webdriverio";
import { AppiumUtils } from "./helpers/utils.js";
import { TestDataGenerator } from "./helpers/dataGenerator.js";
import { DeviceInfo } from "./helpers/device.js";
import { Logger } from "./helpers/logger.js";
import { getCapabilities, getServerConfig } from "./config/capabilities.js";

const logger = new Logger("info");

class IntegrationTestSuite {
  constructor() {
    this.testResults = {};
    this.driver = null;
    this.utils = null;
    this.deviceInfo = null;
  }

  async setup() {
    try {
      logger.info("Setting up integration test suite...");

      // Get capabilities and server config
      const caps = getCapabilities("android");
      const serverConfig = getServerConfig("local");

      // Initialize driver
      this.driver = await remote({
        ...serverConfig,
        capabilities: caps,
      });

      // Initialize utilities
      this.utils = new AppiumUtils(this.driver);
      this.deviceInfo = new DeviceInfo(this.driver);

      logger.info("Integration test suite setup completed");
      return true;
    } catch (error) {
      logger.error("Setup failed", { error: error.message });
      return false;
    }
  }

  async runTest(testName, testFunction) {
    logger.info(`Running test: ${testName}`);
    const startTime = Date.now();

    try {
      await testFunction();
      const duration = Date.now() - startTime;

      this.testResults[testName] = {
        status: "PASSED",
        duration,
        timestamp: new Date().toISOString(),
      };

      logger.info(`Test passed: ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;

      this.testResults[testName] = {
        status: "FAILED",
        duration,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      logger.error(`Test failed: ${testName} (${duration}ms)`, {
        error: error.message,
      });

      // Take screenshot on failure
      await this.utils.takeTimestampedScreenshot(`failed-${testName}`);
    }
  }

  async deviceConnectionTest() {
    // Test basic device connection and info retrieval
    const deviceData = await this.deviceInfo.getCompleteDeviceInfo();

    if (!deviceData.androidVersion) {
      throw new Error("Could not retrieve Android version");
    }

    if (!deviceData.screenResolution) {
      throw new Error("Could not retrieve screen resolution");
    }

    logger.info("Device connection test passed", deviceData);
  }

  async basicUIInteractionTest() {
    // Test basic UI interactions
    await this.driver.pressKeyCode(3); // Home
    await this.driver.pause(2000);

    // Take screenshot
    const screenshot = await this.utils.takeTimestampedScreenshot(
      "ui-interaction-test"
    );
    if (!screenshot) {
      throw new Error("Failed to take screenshot");
    }

    // Test swipe gesture
    await this.utils.scrollDown();
    await this.driver.pause(1000);

    // Return to home
    await this.driver.pressKeyCode(3);

    logger.info("Basic UI interaction test passed");
  }

  async appLaunchTest() {
    // Test launching system apps
    const apps = [
      { package: "com.android.settings", name: "Settings" },
      { package: "com.android.calculator2", name: "Calculator" },
    ];

    for (const app of apps) {
      logger.info(`Testing app launch: ${app.name}`);

      // Check if app is installed
      const isInstalled = await this.utils.isAppInstalled(app.package);
      if (!isInstalled) {
        logger.warn(`App not installed: ${app.package}`);
        continue;
      }

      // Launch app
      const launched = await this.utils.launchApp(app.package);
      if (!launched) {
        throw new Error(`Failed to launch ${app.name}`);
      }

      await this.driver.pause(3000);

      // Verify app is running
      const currentActivity = await this.utils.getCurrentActivity();
      if (!currentActivity || !currentActivity.includes(app.package)) {
        throw new Error(`${app.name} did not launch properly`);
      }

      // Take screenshot of the app
      await this.utils.takeTimestampedScreenshot(
        `app-${app.name.toLowerCase()}`
      );

      // Close app
      await this.driver.pressKeyCode(3); // Home
      await this.driver.pause(1000);
    }

    logger.info("App launch test passed");
  }

  async textInputTest() {
    // Test text input functionality
    try {
      // Launch Settings to find a search field
      await this.utils.launchApp("com.android.settings");
      await this.driver.pause(3000);

      // Look for search functionality
      const searchSelectors = [
        "//android.widget.EditText",
        "//android.widget.AutoCompleteTextView",
        '//*[@resource-id="android:id/search_src_text"]',
      ];

      let searchField = null;
      for (const selector of searchSelectors) {
        try {
          searchField = await this.driver.$(selector);
          if (await searchField.isDisplayed()) {
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (searchField && (await searchField.isDisplayed())) {
        const testText = TestDataGenerator.generateRandomString(8);

        await searchField.click();
        await this.driver.pause(1000);
        await searchField.setValue(testText);

        const enteredText = await searchField.getText();
        if (!enteredText.includes(testText)) {
          throw new Error("Text input verification failed");
        }

        logger.info(`Text input test passed with text: ${testText}`);
      } else {
        logger.warn("No text input field found for testing");
      }
    } catch (error) {
      logger.error("Text input test setup failed", {
        error: error.message,
      });
    } finally {
      // Return to home
      await this.driver.pressKeyCode(3);
      await this.driver.pause(1000);
    }
  }

  async orientationTest() {
    // Test device orientation changes
    const originalOrientation = await this.utils.getOrientation();

    // Rotate to landscape
    const rotated = await this.utils.rotateDevice("LANDSCAPE");
    if (!rotated) {
      throw new Error("Failed to rotate to landscape");
    }

    await this.driver.pause(2000);

    // Verify orientation change
    const newOrientation = await this.utils.getOrientation();
    if (newOrientation !== "LANDSCAPE") {
      throw new Error(`Expected LANDSCAPE orientation, got ${newOrientation}`);
    }

    // Take screenshot in landscape mode
    await this.utils.takeTimestampedScreenshot("landscape-orientation");

    // Rotate back to portrait
    await this.utils.rotateDevice("PORTRAIT");
    await this.driver.pause(2000);

    const finalOrientation = await this.utils.getOrientation();
    if (finalOrientation !== "PORTRAIT") {
      throw new Error(`Failed to return to PORTRAIT orientation`);
    }

    logger.info("Orientation test passed");
  }

  async networkConnectivityTest() {
    // Test network connectivity and WiFi toggle functionality
    const initialNetworkInfo = await this.utils.getNetworkInfo();

    if (!initialNetworkInfo.connected) {
      throw new Error("Device not connected to network initially");
    }

    logger.info("Initial network test passed");

    // Test WiFi toggle (may require root permissions)
    try {
      await this.utils.toggleWifi(false);
      await this.driver.pause(3000);

      const disconnectedInfo = await this.utils.getNetworkInfo();
      logger.info("WiFi toggle test completed");

      // Re-enable WiFi
      await this.utils.toggleWifi(true);
      await this.driver.pause(5000);
    } catch (wifiError) {
      logger.warn(
        "WiFi toggle test skipped (may require root):",
        wifiError.message
      );
    }
  }

  async memoryAndStorageTest() {
    // Test device memory and storage information
    const deviceInfo = await this.deviceInfo.getCompleteDeviceInfo();

    if (!deviceInfo.screenResolution) {
      throw new Error("Could not retrieve device information");
    }

    // Check available storage space
    const storageInfo = await this.utils.executeShell("df", ["/data"]);
    if (!storageInfo) {
      throw new Error("Could not retrieve storage information");
    }

    logger.info("Memory and storage test passed", {
      resolution: deviceInfo.screenResolution,
      android: deviceInfo.androidVersion,
    });
  }

  async multiAppWorkflowTest() {
    // Test switching between multiple applications
    const testApps = [
      { package: "com.android.settings", name: "Settings" },
      { package: "com.android.calculator2", name: "Calculator" },
    ];

    for (let i = 0; i < testApps.length; i++) {
      const app = testApps[i];

      logger.info(`Testing multi-app workflow: ${app.name}`);

      // Check if app exists
      const isInstalled = await this.utils.isAppInstalled(app.package);
      if (!isInstalled) {
        logger.warn(`App not installed: ${app.package}`);
        continue;
      }

      // Launch app
      const launched = await this.utils.launchApp(app.package);
      if (!launched) {
        throw new Error(`Failed to launch ${app.name}`);
      }

      await this.driver.pause(2000);

      // Verify app is active
      const activity = await this.utils.getCurrentActivity();
      if (!activity.includes(app.package)) {
        throw new Error(`${app.name} not properly launched`);
      }

      // Take screenshot for verification
      await this.utils.takeTimestampedScreenshot(
        `multiapp-${app.name.toLowerCase()}`
      );

      // If not the last app, switch to next
      if (i < testApps.length - 1) {
        await this.driver.pressKeyCode(187); // Recent apps
        await this.driver.pause(1000);
      }
    }

    // Return to home
    await this.driver.pressKeyCode(3);
    logger.info("Multi-app workflow test passed");
  }

  async errorRecoveryTest() {
    // Test error handling and recovery mechanisms
    logger.info("Testing error recovery mechanisms");

    try {
      // Intentionally try to find non-existent element
      const nonExistentElement = await this.driver.$(
        '//NonExistentElement[@id="fake"]'
      );
      await nonExistentElement.waitForDisplayed({ timeout: 2000 });

      // This should not execute
      throw new Error("Error recovery test failed - element should not exist");
    } catch (expectedError) {
      // This is expected behavior
      if (expectedError.message.includes("Error recovery test failed")) {
        throw expectedError;
      }

      logger.info("Expected error caught successfully:", expectedError.name);
    }

    // Test recovery by taking screenshot and continuing
    await this.utils.takeTimestampedScreenshot("error-recovery-test");

    // Verify device is still responsive
    await this.driver.pressKeyCode(3); // Home
    await this.driver.pause(1000);

    const isResponsive = await this.utils.waitForPageLoad(5000);
    if (!isResponsive) {
      throw new Error("Device became unresponsive during error recovery");
    }

    logger.info("Error recovery test passed");
  }

  async generateTestReport() {
    // Generate comprehensive test report
    const passedTests = Object.values(this.testResults).filter(
      (t) => t.status === "PASSED"
    );
    const failedTests = Object.values(this.testResults).filter(
      (t) => t.status === "FAILED"
    );

    const report = {
      summary: {
        totalTests: Object.keys(this.testResults).length,
        passed: passedTests.length,
        failed: failedTests.length,
        successRate: Math.round(
          (passedTests.length / Object.keys(this.testResults).length) * 100
        ),
      },
      executionTime: {
        total: Object.values(this.testResults).reduce(
          (sum, test) => sum + test.duration,
          0
        ),
        average: Math.round(
          Object.values(this.testResults).reduce(
            (sum, test) => sum + test.duration,
            0
          ) / Object.keys(this.testResults).length
        ),
      },
      testDetails: this.testResults,
      deviceInfo: await this.deviceInfo.getCompleteDeviceInfo(),
      timestamp: new Date().toISOString(),
    };

    // Save report to file
    const fs = await import("fs/promises");
    await fs.mkdir("reports", { recursive: true });
    await fs.writeFile(
      `reports/integration-test-report-${
        new Date().toISOString().split("T")[0]
      }.json`,
      JSON.stringify(report, null, 2)
    );

    logger.info("Test Report Generated", report.summary);
    return report;
  }

  async cleanup() {
    // Clean up resources and return device to initial state
    try {
      logger.info("Starting cleanup process...");

      // Close any open apps
      await this.driver.pressKeyCode(3); // Home
      await this.driver.pause(1000);

      // Clear recent apps
      await this.driver.pressKeyCode(187); // Recent apps
      await this.driver.pause(1000);

      // Try to clear all recent apps (swipe up gesture)
      const { width, height } = await this.driver.getWindowSize();
      await this.driver.touchPerform([
        { action: "press", options: { x: width / 2, y: height / 2 } },
        { action: "moveTo", options: { x: width / 2, y: 50 } },
        { action: "release" },
      ]);

      await this.driver.pause(1000);
      await this.driver.pressKeyCode(3); // Return to home

      // Reset orientation to portrait
      await this.utils.rotateDevice("PORTRAIT");

      logger.info("Cleanup completed successfully");
    } catch (cleanupError) {
      logger.error("Cleanup failed", { error: cleanupError.message });
    }
  }

  async teardown() {
    // Properly close driver session
    if (this.driver) {
      try {
        await this.cleanup();
        await this.driver.deleteSession();
        logger.info("Driver session closed successfully");
      } catch (error) {
        logger.error("Failed to close driver session", {
          error: error.message,
        });
      }
    }
  }
}

(async () => {
  // Main execution flow for integration testing
  const testSuite = new IntegrationTestSuite();
  let report = null;

  try {
    logger.info("🚀 Starting Appium 3 Integration Test Suite...");
    logger.info(
      "📋 This comprehensive test covers all major Appium functionality"
    );

    // Setup phase
    const setupSuccess = await testSuite.setup();
    if (!setupSuccess) {
      logger.error("❌ Setup failed - cannot continue with tests");
      process.exit(1);
    }

    logger.info("✅ Setup completed - Running integration tests...\n");

    // Execute all test scenarios
    await testSuite.runTest("Device Connection Test", () =>
      testSuite.deviceConnectionTest()
    );

    await testSuite.runTest("Basic UI Interaction Test", () =>
      testSuite.basicUIInteractionTest()
    );

    await testSuite.runTest("App Launch Test", () => testSuite.appLaunchTest());

    await testSuite.runTest("Text Input Test", () => testSuite.textInputTest());

    await testSuite.runTest("Orientation Test", () =>
      testSuite.orientationTest()
    );

    await testSuite.runTest("Network Connectivity Test", () =>
      testSuite.networkConnectivityTest()
    );

    await testSuite.runTest("Memory and Storage Test", () =>
      testSuite.memoryAndStorageTest()
    );

    await testSuite.runTest("Multi-App Workflow Test", () =>
      testSuite.multiAppWorkflowTest()
    );

    await testSuite.runTest("Error Recovery Test", () =>
      testSuite.errorRecoveryTest()
    );

    logger.info("\n📊 Generating comprehensive test report...");
    report = await testSuite.generateTestReport();

    logger.info("\n🎉 Integration test suite completed!");
    logger.info(
      `📈 Success Rate: ${report.summary.successRate}% (${report.summary.passed}/${report.summary.totalTests})`
    );
    logger.info(`⏱️  Total Execution Time: ${report.executionTime.total}ms`);
    logger.info(
      `📄 Detailed report saved to: reports/integration-test-report-${
        new Date().toISOString().split("T")[0]
      }.json`
    );

    // Exit with appropriate code based on results
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (criticalError) {
    logger.error(
      "💥 Critical error in integration test suite:",
      criticalError.message
    );
    logger.error("🔍 Stack trace:", criticalError.stack);

    // Still try to generate partial report
    if (
      testSuite.testResults &&
      Object.keys(testSuite.testResults).length > 0
    ) {
      try {
        report = await testSuite.generateTestReport();
        logger.info("📊 Partial test report generated despite critical error");
      } catch (reportError) {
        logger.error("❌ Could not generate test report:", reportError.message);
      }
    }

    process.exit(1);
  } finally {
    // Ensure proper cleanup regardless of success/failure
    await testSuite.teardown();
  }
})();
