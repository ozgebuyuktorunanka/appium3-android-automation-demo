import { remote } from 'webdriverio';
import fetch from 'node-fetch';
import { Logger } from "./helpers/logger.js";

//Android capabilities configuration for Appium 3
const caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:NewCommandTimeout': 120,
    'appium:autoGrantPermissions': true,
    // Uncomment below line if you want to test with a specific app
    // 'appium:app': '/path/to/your/app.apk',
    // For testing with browser
    'appium:browserName': 'Chrome'
};
const SERVER = 'http://localhost:4723';

(async () => {
    let driver;
    //initialize the logger class in here.
    const logger = new Logger(logLevel);

    try {
        logger.info('🚀 Starting Appium 3 Android demo...');

        // Initialize WebDriver connection to Appium server
        driver = await remote({
            hostname: 'localhost',
            port: 4723,
            path: '/', // Appium 3 default path
            logLevel: 'info',
            capabilities: caps
        });
        logger.info('✅ Successfully connected to Appium server');

        // Get Android version information
        const androidVersion = await driver.execute('mobile: shell', {
            command: 'getprop',
            args: ['ro.build.version.release']
        });
        logger.info('📱 Android Version =>', androidVersion?.trim());

        // Get device model information
        const deviceModel = await driver.execute('mobile: shell', {
            command: 'getprop',
            args: ['ro.product.model']
        });
        logger.info('📱 Device Model =>', deviceModel?.trim());

        // Get screen resolution
        const screenSize = await driver.execute('mobile: shell', {
            command: 'wm',
            args: ['size']
        });
        logger.info('📺 Screen Resolution =>', screenSize?.trim());

        // Wait a moment before starting interactions
        await driver.pause(2000);

        // Basic UI interaction examples
        logger.info('🔧 Performing basic UI interactions...');

        // Press RECENTS button (Key Event 187)
        logger.info('📱 Pressing RECENTS button...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '187']
        });

        await driver.pause(2000);

        // Press HOME button (Key Event 3)
        logger.info('🏠 Pressing HOME button...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '3']
        });

        await driver.pause(2000);

        // Open notification panel by swiping down from top
        logger.info('📥 Opening notification panel...');
        const { width, height } = await driver.getWindowSize();
        await driver.touchPerform([
            { action: 'press', options: { x: width / 2, y: 10 } },
            { action: 'moveTo', options: { x: width / 2, y: height / 2 } },
            { action: 'release' }
        ]);

        await driver.pause(2000);

        // Close notification panel
        logger.info('📤 Closing notification panel...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '4'] // Back button
        });

        await driver.pause(1000);

        // Take a screenshot
        logger.info('📸 Taking screenshot...');
        const screenshot = await driver.takeScreenshot();
        logger.info('Screenshot taken (base64 length):', screenshot.length);

        // Get current activity
        const currentActivity = await driver.getCurrentActivity();
        logger.info('📱 Current Activity:', currentActivity);

        // Get installed packages (first 5)
        logger.info('📦 Getting installed packages...');
        const packages = await driver.execute('mobile: shell', {
            command: 'pm',
            args: ['list', 'packages', '-3'] // -3 for third party apps only
        });
        const packageList = packages.split('\n').slice(0, 5);
        logger.info('📦 First 5 installed packages:', packageList);

        // Example of opening an app (Calculator)
        logger.info('🧮 Trying to open Calculator app...');
        try {
            await driver.execute('mobile: shell', {
                command: 'am',
                args: ['start', '-a', 'android.intent.action.MAIN', '-n', 'com.android.calculator2/.Calculator']
            });
            await driver.pause(3000);

            // If calculator opened, try some basic interactions
            logger.info('🔢 Performing calculator operations...');

            // Try to find and tap number buttons (using UiAutomator2 selectors)
            try {
                const button2 = await driver.$('//android.widget.Button[@text="2"]');
                if (await button2.isExisting()) {
                    await button2.click();
                    logger.info('✅ Clicked number 2');
                }

                await driver.pause(500);

                const buttonPlus = await driver.$('//android.widget.Button[@text="+"]');
                if (await buttonPlus.isExisting()) {
                    await buttonPlus.click();
                    logger.info('✅ Clicked plus button');
                }

                await driver.pause(500);

                const button3 = await driver.$('//android.widget.Button[@text="3"]');
                if (await button3.isExisting()) {
                    await button3.click();
                    logger.info('✅ Clicked number 3');
                }

                await driver.pause(500);

                const buttonEquals = await driver.$('//android.widget.Button[@text="="]');
                if (await buttonEquals.isExisting()) {
                    await buttonEquals.click();
                    logger.info('✅ Clicked equals button');
                }

            } catch (calcError) {
                logger.info('⚠️ Calculator interaction failed:', calcError.message);
            }

        } catch (appError) {
            logger.info('⚠️ Could not open Calculator app:', appError.message);
        }

        await driver.pause(2000);

        // Return to home
        logger.info('🏠 Returning to home screen...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '3']
        });

        logger.info('✅ Demo completed successfully!');

    } catch (error) {
        logger.error('❌ Error during demo execution:', error.message);
        logger.error('Stack trace:', error.stack);
    } finally {
        // Always quit the driver session
        if (driver) {
            logger.info('🛑 Closing driver session...');
            await driver.deleteSession();
            logger.info('✅ Driver session closed');
        }
    }
})();