import { Logger } from '../helpers/logger.js';

const logger = new Logger("info");

// Appium capabilities configurations for different scenarios
export const capabilities = {
    // Standard Android Emulator
    android: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:noReset': false,
        'appium:fullReset': false
    },

    // Real Android Device
    androidReal: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Real Android Device',
        'appium:udid': 'auto', // Will detect connected device
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,
        'appium:fullReset': false
    },

    // Chrome Browser Testing
    androidChrome: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:browserName': 'Chrome',
        'appium:NewCommandTimeout': 120,
        'appium:chromeOptions': {
            w3c: false,
            args: ['--disable-web-security', '--allow-running-insecure-content']
        }
    },

    // Specific App Testing
    androidApp: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:app': '/path/to/your/app.apk', // Update this path
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:noReset': false,
        'appium:fullReset': true // Clean install each time
    },

    // App Package Testing (for installed apps)
    androidPackage: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:appPackage': 'com.example.app', // Update package name
        'appium:appActivity': '.MainActivity', // Update main activity
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:noReset': true
    },

    // High Performance Testing
    androidPerformance: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:NewCommandTimeout': 180,
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,
        'appium:skipDeviceInitialization': true,
        'appium:skipServerInstallation': true,
        'appium:ignoreHiddenApiPolicyError': true
    },

    // Debug Mode
    androidDebug: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:NewCommandTimeout': 300, // Longer timeout for debugging
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,
        'appium:systemPort': 8201, // Custom system port
        'appium:uiautomator2ServerLaunchTimeout': 90000,
        'appium:adbExecTimeout': 60000
    },

    // Tablet Testing
    androidTablet: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Tablet',
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:orientation': 'LANDSCAPE', // Tablets often use landscape
        'appium:autoRotate': true
    },

    // Older Android Version (API 23-25)
    androidOld: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:NewCommandTimeout': 120,
        'appium:autoGrantPermissions': true,
        'appium:noReset': false,
        // Specific settings for older Android versions
        'appium:disableAndroidWatchers': true,
        'appium:skipLogcatCapture': true
    },

    // CI/CD Environment
    androidCI: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:NewCommandTimeout': 180,
        'appium:autoGrantPermissions': true,
        'appium:noReset': true,
        'appium:isHeadless': true, // For headless CI environments
        'appium:skipDeviceInitialization': true,
        'appium:skipServerInstallation': true
    }
};

// Server configurations
export const serverConfig = {
    local: {
        hostname: 'localhost',
        port: 4723,
        path: '/',
        logLevel: 'info'
    },

    remote: {
        hostname: 'your-remote-server.com', // Update this
        port: 4723,
        path: '/wd/hub',
        logLevel: 'info'
    },

    browserstack: {
        hostname: 'hub-cloud.browserstack.com',
        port: 443,
        path: '/wd/hub',
        logLevel: 'info'
    },

    saucelabs: {
        hostname: 'ondemand.saucelabs.com',
        port: 443,
        path: '/wd/hub',
        logLevel: 'info'
    }
};

// Helper function to get capabilities by environment
export function getCapabilities(type = 'android', customOptions = {}) {
    const baseCaps = capabilities[type];

    if (!baseCaps) {
        throw new Error(`Capability type '${type}' not found. Available types: ${Object.keys(capabilities).join(', ')}`);
    }

    // Merge with custom options
    return {
        ...baseCaps,
        ...customOptions
    };
}

// Helper function to get server config
export function getServerConfig(environment = 'local', customOptions = {}) {
    const baseConfig = serverConfig[environment];

    if (!baseConfig) {
        throw new Error(`Server config '${environment}' not found. Available configs: ${Object.keys(serverConfig).join(', ')}`);
    }

    return {
        ...baseConfig,
        ...customOptions
    };
}

// Environment-specific capability builders
export class CapabilityBuilder {
    constructor() {
        this.caps = {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:NewCommandTimeout': 120
        };
    }

    setDevice(deviceName) {
        this.caps['appium:deviceName'] = deviceName;
        return this;
    }

    setUDID(udid) {
        this.caps['appium:udid'] = udid;
        return this;
    }

    setApp(appPath) {
        this.caps['appium:app'] = appPath;
        return this;
    }

    setPackage(packageName, activityName = null) {
        this.caps['appium:appPackage'] = packageName;
        if (activityName) {
            this.caps['appium:appActivity'] = activityName;
        }
        return this;
    }

    setBrowser(browserName) {
        this.caps['appium:browserName'] = browserName;
        return this;
    }

    setOrientation(orientation) {
        this.caps['appium:orientation'] = orientation;
        return this;
    }

    enableAutoGrantPermissions() {
        this.caps['appium:autoGrantPermissions'] = true;
        return this;
    }

    setNoReset(noReset = true) {
        this.caps['appium:noReset'] = noReset;
        return this;
    }

    setFullReset(fullReset = true) {
        this.caps['appium:fullReset'] = fullReset;
        return this;
    }

    setTimeout(timeout) {
        this.caps['appium:NewCommandTimeout'] = timeout;
        return this;
    }

    addCustomCapability(key, value) {
        this.caps[key] = value;
        return this;
    }

    build() {
        return { ...this.caps };
    }
}

// Example usage function
export function createExampleCapabilities() {
    logger.info('=== Capability Examples ===\n');

    // Basic Android
    logger.info('1. Basic Android Emulator:');
    logger.info(JSON.stringify(getCapabilities('android'), null, 2));

    // Real Device
    logger.info('\n2. Real Android Device:');
    logger.info(JSON.stringify(getCapabilities('androidReal'), null, 2));

    // Chrome Browser
    logger.info('\n3. Chrome Browser:');
    logger.info(JSON.stringify(getCapabilities('androidChrome'), null, 2));

    // Using Builder Pattern
    logger.info('\n4. Using Builder Pattern:');
    const customCaps = new CapabilityBuilder()
        .setDevice('Pixel 7')
        .setPackage('com.example.app', '.MainActivity')
        .enableAutoGrantPermissions()
        .setNoReset(true)
        .setTimeout(180)
        .build();
    logger.info(JSON.stringify(customCaps, null, 2));
    logger.info('\n=========================');
}