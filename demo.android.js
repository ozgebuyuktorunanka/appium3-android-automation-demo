import { remote } from 'webdriverio';
import fetch from 'node-fetch';

// Android capabilities configuration for Appium 3
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

    try {
        console.log('🚀 Starting Appium 3 Android demo...');

        // Initialize WebDriver connection to Appium server
        driver = await remote({
            hostname: 'localhost',
            port: 4723,
            path: '/', // Appium 3 default path
            logLevel: 'info',
            capabilities: caps
        });

        console.log('✅ Successfully connected to Appium server');

        // Get Android version information
        const androidVersion = await driver.execute('mobile: shell', {
            command: 'getprop',
            args: ['ro.build.version.release']
        });
        console.log('📱 Android Version =>', androidVersion?.trim());

        // Get device model information
        const deviceModel = await driver.execute('mobile: shell', {
            command: 'getprop',
            args: ['ro.product.model']
        });
        console.log('📱 Device Model =>', deviceModel?.trim());

        // Get screen resolution
        const screenSize = await driver.execute('mobile: shell', {
            command: 'wm',
            args: ['size']
        });
        console.log('📺 Screen Resolution =>', screenSize?.trim());

        // Wait a moment before starting interactions
        await driver.pause(2000);

        // Basic UI interaction examples
        console.log('🔧 Performing basic UI interactions...');

        // Press RECENTS button (Key Event 187)
        console.log('📱 Pressing RECENTS button...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '187']
        });

        await driver.pause(2000);

        // Press HOME button (Key Event 3)
        console.log('🏠 Pressing HOME button...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '3']
        });

        await driver.pause(2000);

        // Open notification panel by swiping down from top
        console.log('📥 Opening notification panel...');
        const { width, height } = await driver.getWindowSize();
        await driver.touchPerform([
            { action: 'press', options: { x: width / 2, y: 10 } },
            { action: 'moveTo', options: { x: width / 2, y: height / 2 } },
            { action: 'release' }
        ]);

        await driver.pause(2000);

        // Close notification panel
        console.log('📤 Closing notification panel...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '4'] // Back button
        });

        await driver.pause(1000);

        // Take a screenshot
        console.log('📸 Taking screenshot...');
        const screenshot = await driver.takeScreenshot();
        console.log('Screenshot taken (base64 length):', screenshot.length);

        // Get current activity
        const currentActivity = await driver.getCurrentActivity();
        console.log('📱 Current Activity:', currentActivity);

        // Get installed packages (first 5)
        console.log('📦 Getting installed packages...');
        const packages = await driver.execute('mobile: shell', {
            command: 'pm',
            args: ['list', 'packages', '-3'] // -3 for third party apps only
        });
        const packageList = packages.split('\n').slice(0, 5);
        console.log('📦 First 5 installed packages:', packageList);

        // Example of opening an app (Calculator)
        console.log('🧮 Trying to open Calculator app...');
        try {
            await driver.execute('mobile: shell', {
                command: 'am',
                args: ['start', '-a', 'android.intent.action.MAIN', '-n', 'com.android.calculator2/.Calculator']
            });
            await driver.pause(3000);

            // If calculator opened, try some basic interactions
            console.log('🔢 Performing calculator operations...');

            // Try to find and tap number buttons (using UiAutomator2 selectors)
            try {
                const button2 = await driver.$('//android.widget.Button[@text="2"]');
                if (await button2.isExisting()) {
                    await button2.click();
                    console.log('✅ Clicked number 2');
                }

                await driver.pause(500);

                const buttonPlus = await driver.$('//android.widget.Button[@text="+"]');
                if (await buttonPlus.isExisting()) {
                    await buttonPlus.click();
                    console.log('✅ Clicked plus button');
                }

                await driver.pause(500);

                const button3 = await driver.$('//android.widget.Button[@text="3"]');
                if (await button3.isExisting()) {
                    await button3.click();
                    console.log('✅ Clicked number 3');
                }

                await driver.pause(500);

                const buttonEquals = await driver.$('//android.widget.Button[@text="="]');
                if (await buttonEquals.isExisting()) {
                    await buttonEquals.click();
                    console.log('✅ Clicked equals button');
                }

            } catch (calcError) {
                console.log('⚠️ Calculator interaction failed:', calcError.message);
            }

        } catch (appError) {
            console.log('⚠️ Could not open Calculator app:', appError.message);
        }

        await driver.pause(2000);

        // Return to home
        console.log('🏠 Returning to home screen...');
        await driver.execute('mobile: shell', {
            command: 'input',
            args: ['keyevent', '3']
        });

        console.log('✅ Demo completed successfully!');

    } catch (error) {
        console.error('❌ Error during demo execution:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Always quit the driver session
        if (driver) {
            console.log('🛑 Closing driver session...');
            await driver.deleteSession();
            console.log('✅ Driver session closed');
        }
    }
})();