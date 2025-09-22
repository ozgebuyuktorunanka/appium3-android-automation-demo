# Appium 3 Android Automation Demo Collection

Complete Android mobile automation examples using Appium 3 and WebDriverIO. Choose the right demo for your testing needs.

## Quick Start

1. Install Node.js 16+ and Android Studio
2. Set up environment variables for Android SDK
3. Install Appium: `npm install -g appium`
4. Install UiAutomator2 driver: `appium driver install uiautomator2`
5. Clone repository and run `npm install`
6. Start emulator and run `appium` in separate terminal
7. Choose and run appropriate demo script

## Environment Variables Setup

Add to your shell config file (.zshrc or .bash_profile):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

For Apple Silicon Macs, also add:
```bash
export ANDROID_EMULATOR_USE_SYSTEM_LIBS=1
```

## Demo Scripts Overview

### demo.android.js - Basic Device Automation
**Use when**: Learning Appium basics or testing emulator setup
- Device information collection
- Basic UI interactions (home, back, recents buttons)
- Screenshot capture
- Simple app launching (Calculator)
- System command execution

### demo.real-device.js - Physical Device Testing
**Use when**: Testing with USB-connected Android phone/tablet
- Real device detection and connection
- Battery status monitoring
- Device-specific sensor testing
- Hardware feature validation
- Performance on actual hardware

### demo.app-testing.js - Web Browser Automation
**Use when**: Testing mobile web applications
- Chrome browser automation
- Mobile responsive testing
- Web page navigation
- Touch interactions on web elements
- Mobile viewport testing

### demo.gestures.js - Advanced Touch Interactions
**Use when**: Testing complex gesture-based apps
- Swipe gestures (up, down, left, right)
- Pinch zoom and multi-touch
- Long press and double tap
- Scroll to find elements
- Complex gesture combinations

### demo.performance.js - Performance Monitoring
**Use when**: Measuring app performance and device resource usage
- Action execution timing
- Memory and CPU monitoring
- Battery usage tracking
- Performance metrics collection
- Automated performance reporting

### demo.integration.js - Complete Test Suite
**Use when**: Running comprehensive validation tests
- Multiple test scenarios
- Error handling and recovery
- Screenshot capture on failures
- Test result reporting
- Full device capability testing

## Which Demo Should You Run?

```
Start Here
    |
    v
Do you have a physical Android device connected?
    |
    |-- YES --> demo.real-device.js
    |
    |-- NO --> Are you testing a web application?
               |
               |-- YES --> demo.app-testing.js
               |
               |-- NO --> Do you need gesture testing?
                          |
                          |-- YES --> demo.gestures.js
                          |
                          |-- NO --> Do you need performance metrics?
                                     |
                                     |-- YES --> demo.performance.js
                                     |
                                     |-- NO --> Are you new to Appium?
                                                |
                                                |-- YES --> demo.android.js
                                                |
                                                |-- NO --> demo.integration.js
```

## Running Scripts

Basic usage:
```bash
# Start Appium server (in one terminal)
appium

# Run chosen demo (in another terminal)
node demo.android.js
node demo.real-device.js
node demo.app-testing.js
node demo.gestures.js
node demo.performance.js
node demo.integration.js
```

## Helper Files

### helpers/utils.js
Utility functions for common automation tasks:
- Element finding with timeout
- Safe clicking and text input
- Screenshot capture with timestamps
- Device information collection
- App management (install, launch, close)

### config/capabilities.js
Pre-configured capability sets for different scenarios:
- Standard emulator testing
- Real device testing
- Browser automation
- Performance testing
- CI/CD environments

## Project Structure

```
appium3-android-demo/
├── demo.android.js           # Basic automation
├── demo.real-device.js       # Physical device testing
├── demo.app-testing.js       # Browser automation
├── demo.gestures.js          # Gesture interactions
├── demo.performance.js       # Performance monitoring
├── demo.integration.js       # Complete test suite
├── helpers/
│   └── utils.js             # Utility functions
├── config/
│   └── capabilities.js      # Capability configurations
└── screenshots/             # Generated screenshots
```

## Common Issues

**Device not detected**: Run `adb devices` to verify connection
**Appium connection failed**: Ensure server is running on port 4723
**Element not found**: UI elements vary between Android versions
**Slow performance on Mac**: Use ARM64 system images for Apple Silicon

## Requirements

- Node.js 16+
- Android Studio with SDK
- Android emulator or physical device
- Appium 3.x
- USB debugging enabled (for real devices)

## Next Steps After Running Demos

1. Modify capability configurations in config/capabilities.js
2. Add your own test scenarios using helper functions
3. Integrate with testing frameworks like Mocha or Jest
4. Set up CI/CD pipeline with headless execution
5. Explore advanced Appium features and gestures

This collection provides practical examples for different Android automation scenarios. Start with demo.android.js if you're new to Appium, then progress to more specific demos based on your testing needs.