# Appium 3 Android Automation Demo

A comprehensive demo project showcasing Android mobile automation using Appium 3 with WebDriverIO. This project demonstrates basic device interactions, UI automation, and app testing capabilities on Android devices and emulators.

## Prerequisites

Before starting with this project, ensure you have the following installed on your system:

- Node.js (version 16 or higher)
- npm or yarn package manager
- Android Studio (latest version)
- Java Development Kit (JDK 8 or higher)
- Git

## Environment Setup

### 1. Install Android Studio and SDK

Download and install Android Studio from the official website. During installation, make sure to include the Android SDK, Android SDK Platform-Tools, and Android Virtual Device.

### 2. Configure Environment Variables

Add the following environment variables to your shell configuration file (.bashrc, .zshrc, or equivalent):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

For Apple Silicon Macs (M1, M2, M3, M4), also add:
```bash
export ANDROID_EMULATOR_USE_SYSTEM_LIBS=1
```

Reload your shell configuration:
```bash
source ~/.zshrc
```

### 3. Create Android Virtual Device

Open Android Studio and navigate to Tools > AVD Manager. Create a new virtual device with the following specifications:

- Device: Pixel 7 or similar
- System Image: Android 13 (API 33) or Android 14 (API 34)
- Architecture: arm64-v8a (for Apple Silicon) or x86_64 (for Intel)

### 4. Install Appium

Install Appium globally using npm:

```bash
npm install -g appium
```

Install the UiAutomator2 driver:

```bash
appium driver install uiautomator2
```

Verify the installation:

```bash
appium doctor --android
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/appium3-android-demo.git
cd appium3-android-demo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Installation

Check if all required tools are properly installed:

```bash
adb version
emulator -help
appium --version
```

## Running the Demo

### 1. Start Android Emulator

Launch your Android emulator:

```bash
emulator -avd your_emulator_name
```

Alternatively, start the emulator from Android Studio's AVD Manager.

### 2. Verify Device Connection

Ensure your emulator is detected:

```bash
adb devices
```

You should see your emulator listed with its ID.

### 3. Start Appium Server

In a separate terminal window, start the Appium server:

```bash
appium
```

The server will start on http://localhost:4723 by default.

### 4. Run the Demo Script

Execute the automation demo:

```bash
npm start
```

or

```bash
node demo.android.js
```

## What the Demo Does

The demo script performs the following automated actions:

1. **Device Information Retrieval**
   - Gets Android version
   - Retrieves device model
   - Checks screen resolution

2. **Basic UI Interactions**
   - Presses hardware buttons (Home, Recent apps, Back)
   - Opens and closes notification panel
   - Performs swipe gestures

3. **Screenshot Capture**
   - Takes device screenshots
   - Logs screenshot information

4. **App Automation**
   - Launches Calculator app
   - Performs basic calculations
   - Demonstrates element finding and interaction

5. **System Information**
   - Lists installed packages
   - Gets current activity information

## Project Structure

```
appium3-android-demo/
├── demo.android.js          # Main demo script
├── package.json            # Project dependencies and scripts
├── README.md              # Project documentation
└── screenshots/           # Generated screenshots (created during execution)
```

## Configuration Options

You can modify the capabilities in demo.android.js to suit your testing needs:

```javascript
const caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:NewCommandTimeout': 120,
    'appium:autoGrantPermissions': true,
    // Add more capabilities as needed
};
```

## Troubleshooting

### Common Issues and Solutions

**Emulator not detected**
- Ensure the emulator is fully booted before running the script
- Check if adb can see the device with `adb devices`

**Appium server connection failed**
- Verify Appium server is running on port 4723
- Check firewall settings if using remote devices

**Element not found errors**
- UI elements may vary between Android versions
- Check if the app is properly installed and launched
- Verify element selectors are correct

**Performance issues on Apple Silicon**
- Use ARM64 system images instead of x86
- Enable hardware acceleration in AVD settings
- Allocate sufficient RAM to the emulator

### Getting Help

If you encounter issues:

1. Check the Appium logs for detailed error messages
2. Verify your environment setup with `appium doctor`
3. Ensure all dependencies are properly installed
4. Review the Android emulator logs

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines

1. Follow existing code style and conventions
2. Add appropriate comments for complex operations
3. Test your changes on different Android versions
4. Update documentation for new features

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Resources

- [Appium Documentation](http://appium.io/docs/en/about-appium/intro/)
- [WebDriverIO Documentation](https://webdriver.io/)
- [Android Developer Documentation](https://developer.android.com/)
- [UiAutomator2 Driver](https://github.com/appium/appium-uiautomator2-driver)

## Acknowledgments

This project demonstrates the capabilities of Appium 3 for Android automation testing. Special thanks to the Appium community for their continuous development and support.

---

For questions or support, please open an issue in the repository or contact the maintainers.