// Utility functions for Appium automation

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
            console.log(`Element not found: ${selector}`);
            throw error;
        }
    }

    // Safe click with existence check
    async safeClick(selector, timeout = 5000) {
        try {
            const element = await this.waitForElement(selector, timeout);
            await element.click();
            console.log(`Successfully clicked: ${selector}`);
            return true;
        } catch (error) {
            console.log(`Safe click failed: ${selector} - ${error.message}`);
            return false;
        }
    }

    // Safe text input
    async safeSetValue(selector, text, timeout = 5000) {
        try {
            const element = await this.waitForElement(selector, timeout);
            await element.clearValue();
            await element.setValue(text);
            console.log(`Successfully set value "${text}" to: ${selector}`);
            return true;
        } catch (error) {
            console.log(`Safe set value failed: ${selector} - ${error.message}`);
            return false;
        }
    }

    // Get text with fallback
    async safeGetText(selector, defaultText = '', timeout = 5000) {
        try {
            const element = await this.waitForElement(selector, timeout);
            const text = await element.getText();
            return text || defaultText;
        } catch (error) {
            console.log(`Get text failed: ${selector} - ${error.message}`);
            return defaultText;
        }
    }

    // Smart scroll to find element
    async scrollToElement(selector, maxScrolls = 5, direction = 'down') {
        let scrollCount = 0;
        const { width, height } = await this.driver.getWindowSize();

        while (scrollCount < maxScrolls) {
            try {
                const element = await this.driver.$(selector);
                if (await element.isDisplayed()) {
                    console.log(`Found element after ${scrollCount} scrolls: ${selector}`);
                    return element;
                }
            } catch (error) {
                // Element not found, continue scrolling
            }

            // Perform scroll based on direction
            if (direction === 'down') {
                await this.scrollDown();
            } else if (direction === 'up') {
                await this.scrollUp();
            }

            scrollCount++;
            await this.driver.pause(1000);
        }

        throw new Error(`Element not found after ${maxScrolls} scrolls: ${selector}`);
    }

    // Scroll down
    async scrollDown() {
        const { width, height } = await this.driver.getWindowSize();
        await this.driver.touchPerform([
            { action: 'press', options: { x: width / 2, y: height * 0.8 } },
            { action: 'moveTo', options: { x: width / 2, y: height * 0.2 } },
            { action: 'release' }
        ]);
    }

    // Scroll up
    async scrollUp() {
        const { width, height } = await this.driver.getWindowSize();
        await this.driver.touchPerform([
            { action: 'press', options: { x: width / 2, y: height * 0.2 } },
            { action: 'moveTo', options: { x: width / 2, y: height * 0.8 } },
            { action: 'release' }
        ]);
    }

    // Take screenshot with timestamp
    async takeTimestampedScreenshot(filename = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = filename || `screenshot-${timestamp}`;

        try {
            const screenshot = await this.driver.takeScreenshot();

            // Save to file if needed
            if (filename) {
                const fs = await import('fs/promises');
                await fs.mkdir('screenshots', { recursive: true });
                await fs.writeFile(`screenshots/${screenshotName}.png`, screenshot, 'base64');
                console.log(`Screenshot saved: screenshots/${screenshotName}.png`);
            }

            return screenshot;
        } catch (error) {
            console.log(`Screenshot failed: ${error.message}`);
            return null;
        }
    }

    // Wait for page to load
    async waitForPageLoad(timeout = 10000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            try {
                // Check if page is interactive by looking for any clickable element
                const elements = await this.driver.$('//android.widget.Button | //android.widget.TextView | //android.widget.ImageView');
                if (elements.length > 0) {
                    console.log('Page loaded successfully');
                    return true;
                }
            } catch (error) {
                // Continue waiting
            }

            await this.driver.pause(500);
        }

        console.log('Page load timeout reached');
        return false;
    }

    // Get device orientation
    async getOrientation() {
        try {
            const orientation = await this.driver.getOrientation();
            console.log(`Current orientation: ${orientation}`);
            return orientation;
        } catch (error) {
            console.log(`Get orientation failed: ${error.message}`);
            return null;
        }
    }

    // Rotate device
    async rotateDevice(orientation = 'LANDSCAPE') {
        try {
            await this.driver.setOrientation(orientation);
            await this.driver.pause(2000); // Wait for rotation to complete
            console.log(`Device rotated to: ${orientation}`);
            return true;
        } catch (error) {
            console.log(`Rotation failed: ${error.message}`);
            return false;
        }
    }

    // Check if app is installed
    async isAppInstalled(packageName) {
        try {
            const result = await this.driver.execute('mobile: shell', {
                command: 'pm',
                args: ['list', 'packages', packageName]
            });

            const isInstalled = result.includes(packageName);
            console.log(`App ${packageName} ${isInstalled ? 'is' : 'is not'} installed`);
            return isInstalled;
        } catch (error) {
            console.log(`Check app installation failed: ${error.message}`);
            return false;
        }
    }

    // Launch app by package name
    async launchApp(packageName, activityName = null) {
        try {
            if (activityName) {
                await this.driver.execute('mobile: shell', {
                    command: 'am',
                    args: ['start', '-n', `${packageName}/${activityName}`]
                });
            } else {
                await this.driver.execute('mobile: shell', {
                    command: 'monkey',
                    args: ['-p', packageName, '1']
                });
            }

            await this.driver.pause(3000);
            console.log(`Launched app: ${packageName}`);
            return true;
        } catch (error) {
            console.log(`Launch app failed: ${error.message}`);
            return false;
        }
    }

    // Close app
    async closeApp(packageName) {
        try {
            await this.driver.execute('mobile: shell', {
                command: 'am',
                args: ['force-stop', packageName]
            });
            console.log(`Closed app: ${packageName}`);
            return true;
        } catch (error) {
            console.log(`Close app failed: ${error.message}`);
            return false;
        }
    }

    // Clear app data
    async clearAppData(packageName) {
        try {
            await this.driver.execute('mobile: shell', {
                command: 'pm',
                args: ['clear', packageName]
            });
            console.log(`Cleared data for app: ${packageName}`);
            return true;
        } catch (error) {
            console.log(`Clear app data failed: ${error.message}`);
            return false;
        }
    }

    // Get network info
    async getNetworkInfo() {
        try {
            const networkData = await this.driver.execute('mobile: shell', {
                command: 'dumpsys',
                args: ['connectivity']
            });

            // Parse basic connectivity info
            const isConnected = networkData.includes('NetworkInfo: type: WIFI') ||
                networkData.includes('NetworkInfo: type: MOBILE');

            return {
                connected: isConnected,
                rawData: networkData.substring(0, 500) // First 500 chars for preview
            };
        } catch (error) {
            console.log(`Get network info failed: ${error.message}`);
            return { connected: false, rawData: null };
        }
    }

    // Enable/disable WiFi
    async toggleWifi(enable = true) {
        try {
            const action = enable ? 'enable' : 'disable';
            await this.driver.execute('mobile: shell', {
                command: 'svc',
                args: ['wifi', action]
            });

            await this.driver.pause(2000);
            console.log(`WiFi ${action}d`);
            return true;
        } catch (error) {
            console.log(`WiFi toggle failed: ${error.message}`);
            return false;
        }
    }

    // Get current activity
    async getCurrentActivity() {
        try {
            const activity = await this.driver.getCurrentActivity();
            console.log(`Current activity: ${activity}`);
            return activity;
        } catch (error) {
            console.log(`Get current activity failed: ${error.message}`);
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
                // Continue waiting
            }

            await this.driver.pause(interval);
        }

        throw new Error(`Wait condition timeout after ${timeout}ms`);
    }

    // Execute shell command safely
    async executeShell(command, args = []) {
        try {
            const result = await this.driver.execute('mobile: shell', {
                command,
                args
            });
            console.log(`Shell command executed: ${command} ${args.join(' ')}`);
            return result;
        } catch (error) {
            console.log(`Shell command failed: ${command} - ${error.message}`);
            return null;
        }
    }
}

// Device information utilities
export class DeviceInfo {
    constructor(driver) {
        this.driver = driver;
        this.utils = new AppiumUtils(driver);
    }

    async getCompleteDeviceInfo() {
        console.log('Gathering complete device information...');

        const deviceInfo = {};

        try {
            // Basic device info
            deviceInfo.androidVersion = await this.utils.executeShell('getprop', ['ro.build.version.release']);
            deviceInfo.deviceModel = await this.utils.executeShell('getprop', ['ro.product.model']);
            deviceInfo.manufacturer = await this.utils.executeShell('getprop', ['ro.product.manufacturer']);
            deviceInfo.brand = await this.utils.executeShell('getprop', ['ro.product.brand']);
            deviceInfo.buildVersion = await this.utils.executeShell('getprop', ['ro.build.version.incremental']);

            // Screen info
            const windowSize = await this.driver.getWindowSize();
            deviceInfo.screenResolution = `${windowSize.width}x${windowSize.height}`;
            deviceInfo.orientation = await this.utils.getOrientation();

            // System info
            deviceInfo.apiLevel = await this.utils.executeShell('getprop', ['ro.build.version.sdk']);
            deviceInfo.kernelVersion = await this.utils.executeShell('uname', ['-r']);

            // Network info
            const networkInfo = await this.utils.getNetworkInfo();
            deviceInfo.networkConnected = networkInfo.connected;

            console.log('Device info collected:', JSON.stringify(deviceInfo, null, 2));
            return deviceInfo;

        } catch (error) {
            console.log(`Device info collection failed: ${error.message}`);
            return deviceInfo;
        }
    }
}

// Test data generators
export class TestDataGenerator {
    static generateRandomEmail() {
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'test.com'];
        const randomString = Math.random().toString(36).substring(2, 8);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `test_${randomString}@${domain}`;
    }

    static generateRandomPhoneNumber() {
        const areaCode = Math.floor(Math.random() * 900) + 100;
        const firstThree = Math.floor(Math.random() * 900) + 100;
        const lastFour = Math.floor(Math.random() * 9000) + 1000;
        return `${areaCode}-${firstThree}-${lastFour}`;
    }

    static generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static generateRandomDate(startYear = 1990, endYear = 2023) {
        const start = new Date(startYear, 0, 1);
        const end = new Date(endYear, 11, 31);
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return new Date(randomTime);
    }
}

// Logging utilities
export class Logger {
    constructor(logLevel = 'info') {
        this.logLevel = logLevel;
        this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    }

    log(level, message, data = null) {
        if (this.levels[level] <= this.levels[this.logLevel]) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

            console.log(logMessage);
            if (data) {
                console.log(JSON.stringify(data, null, 2));
            }
        }
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    debug(message, data = null) {
        this.log('debug', message, data);
    }
}