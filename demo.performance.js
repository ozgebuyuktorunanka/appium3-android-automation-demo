import { remote } from "webdriverio";

const caps = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:NewCommandTimeout": 120,
  "appium:autoGrantPermissions": true,
};

class PerformanceMonitor {
  constructor(driver) {
    this.driver = driver;
    this.metrics = {};
  }

  async measureActionTime(actionName, actionFunction) {
    console.log(`Measuring performance for: ${actionName}`);
    const startTime = Date.now();

    try {
      await actionFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.metrics[actionName] = {
        duration: duration,
        success: true,
        timestamp: new Date().toISOString(),
      };

      console.log(`${actionName} completed in ${duration}ms`);
      return duration;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.metrics[actionName] = {
        duration: duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      console.log(`${actionName} failed after ${duration}ms: ${error.message}`);
      return duration;
    }
  }

  async getDevicePerformanceData() {
    console.log("Collecting device performance data...");

    try {
      // CPU Usage
      const cpuInfo = await this.driver.execute("mobile: shell", {
        command: "cat",
        args: ["/proc/cpuinfo"],
      });

      // Memory info
      const memInfo = await this.driver.execute("mobile: shell", {
        command: "cat",
        args: ["/proc/meminfo"],
      });

      // Battery info
      const batteryLevel = await this.driver.execute("mobile: shell", {
        command: "dumpsys",
        args: ["battery", "|", "grep", "level"],
      });

      // Storage info
      const storageInfo = await this.driver.execute("mobile: shell", {
        command: "df",
        args: ["/data"],
      });

      return {
        cpu: this.parseCpuInfo(cpuInfo),
        memory: this.parseMemoryInfo(memInfo),
        battery: this.parseBatteryLevel(batteryLevel),
        storage: this.parseStorageInfo(storageInfo),
      };
    } catch (error) {
      console.log("Performance data collection failed:", error.message);
      return null;
    }
  }

  parseCpuInfo(cpuInfo) {
    const lines = cpuInfo.split("\n");
    const processors = lines.filter((line) =>
      line.includes("processor")
    ).length;
    return { processors };
  }

  parseMemoryInfo(memInfo) {
    const lines = memInfo.split("\n");
    const totalMemLine = lines.find((line) => line.includes("MemTotal:"));
    const freeMemLine = lines.find((line) => line.includes("MemFree:"));

    if (totalMemLine && freeMemLine) {
      const total = parseInt(totalMemLine.match(/\d+/)[0]);
      const free = parseInt(freeMemLine.match(/\d+/)[0]);
      return {
        totalKB: total,
        freeKB: free,
        usedKB: total - free,
        usagePercent: Math.round(((total - free) / total) * 100),
      };
    }
    return null;
  }

  parseBatteryLevel(batteryInfo) {
    const match = batteryInfo.match(/level: (\d+)/);
    return match ? { level: parseInt(match[1]) } : null;
  }

  parseStorageInfo(storageInfo) {
    const lines = storageInfo.split("\n");
    const dataLine = lines.find((line) => line.includes("/data"));

    if (dataLine) {
      const parts = dataLine.split(/\s+/);
      if (parts.length >= 6) {
        return {
          total: parts[1],
          used: parts[2],
          available: parts[3],
          usagePercent: parts[4],
        };
      }
    }
    return null;
  }

  generatePerformanceReport() {
    console.log("\n=== PERFORMANCE REPORT ===");
    console.log("Action Performance Metrics:");

    for (const [action, data] of Object.entries(this.metrics)) {
      const status = data.success ? "✅" : "❌";
      console.log(`${status} ${action}: ${data.duration}ms`);
      if (!data.success) {
        console.log(`   Error: ${data.error}`);
      }
    }

    // Calculate statistics
    const successfulActions = Object.values(this.metrics).filter(
      (m) => m.success
    );
    if (successfulActions.length > 0) {
      const durations = successfulActions.map((m) => m.duration);
      const avgDuration = Math.round(
        durations.reduce((a, b) => a + b, 0) / durations.length
      );
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      console.log("\nStatistics:");
      console.log(`Average action time: ${avgDuration}ms`);
      console.log(`Fastest action: ${minDuration}ms`);
      console.log(`Slowest action: ${maxDuration}ms`);
      console.log(
        `Success rate: ${Math.round(
          (successfulActions.length / Object.keys(this.metrics).length) * 100
        )}%`
      );
    }

    console.log("========================\n");
    return this.metrics;
  }
}

(async () => {
  let driver;

  try {
    console.log("Starting performance monitoring demo...");

    driver = await remote({
      hostname: "localhost",
      port: 4723,
      path: "/",
      logLevel: "info",
      capabilities: caps,
    });

    const performanceMonitor = new PerformanceMonitor(driver);

    console.log("Connected successfully - Starting performance tests...");

    // Get initial device performance data
    const initialPerf = await performanceMonitor.getDevicePerformanceData();
    if (initialPerf) {
      console.log(
        "Initial device performance:",
        JSON.stringify(initialPerf, null, 2)
      );
    }

    // Measure various actions
    await performanceMonitor.measureActionTime(
      "Home Button Press",
      async () => {
        await driver.pressKeyCode(3);
        await driver.pause(1000);
      }
    );

    await performanceMonitor.measureActionTime(
      "Screenshot Capture",
      async () => {
        await driver.takeScreenshot();
      }
    );

    await performanceMonitor.measureActionTime("Get Window Size", async () => {
      await driver.getWindowSize();
    });

    await performanceMonitor.measureActionTime("Get Device Info", async () => {
      await driver.execute("mobile: deviceInfo");
    });

    await performanceMonitor.measureActionTime("Open App Drawer", async () => {
      const { width, height } = await driver.getWindowSize();
      await driver.touchPerform([
        { action: "press", options: { x: width / 2, y: height - 100 } },
        { action: "moveTo", options: { x: width / 2, y: height / 2 } },
        { action: "release" },
      ]);
      await driver.pause(2000);
    });

    await performanceMonitor.measureActionTime(
      "Find Element by XPath",
      async () => {
        try {
          const element = await driver.$("//android.widget.TextView");
          await element.isDisplayed();
        } catch (error) {
          // Element might not exist, but we're measuring the search time
        }
      }
    );

    await performanceMonitor.measureActionTime(
      "Multiple Element Search",
      async () => {
        await driver.$$("//android.widget.TextView");
      }
    );

    await performanceMonitor.measureActionTime("Swipe Gesture", async () => {
      const { width, height } = await driver.getWindowSize();
      await driver.touchPerform([
        { action: "press", options: { x: width / 2, y: height * 0.8 } },
        { action: "moveTo", options: { x: width / 2, y: height * 0.2 } },
        { action: "release" },
      ]);
      await driver.pause(500);
    });

    await performanceMonitor.measureActionTime(
      "Open Calculator App",
      async () => {
        await driver.execute("mobile: shell", {
          command: "am",
          args: [
            "start",
            "-a",
            "android.intent.action.MAIN",
            "-n",
            "com.android.calculator2/.Calculator",
          ],
        });
        await driver.pause(3000);
      }
    );

    await performanceMonitor.measureActionTime(
      "Calculator Button Press",
      async () => {
        try {
          const button = await driver.$('//android.widget.Button[@text="1"]');
          if (await button.isExisting()) {
            await button.click();
          }
        } catch (error) {
          // Button might not be found
        }
      }
    );

    // Return to home
    await driver.pressKeyCode(3);

    // Get final device performance data
    const finalPerf = await performanceMonitor.getDevicePerformanceData();
    if (finalPerf && initialPerf) {
      console.log("Performance comparison:");
      if (initialPerf.memory && finalPerf.memory) {
        const memoryChange =
          finalPerf.memory.usedKB - initialPerf.memory.usedKB;
        console.log(
          `Memory usage change: ${
            memoryChange > 0 ? "+" : ""
          }${memoryChange} KB`
        );
      }
    }

    // Generate and display performance report
    const report = performanceMonitor.generatePerformanceReport();

    // Save report to file (optional)
    const fs = await import("fs/promises");
    await fs.writeFile(
      "performance-report.json",
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          deviceInfo: initialPerf,
          metrics: report,
        },
        null,
        2
      )
    );

    console.log("Performance report saved to performance-report.json");
    console.log("Performance monitoring demo completed!");
  } catch (error) {
    console.error("Performance demo error:", error.message);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
})();
