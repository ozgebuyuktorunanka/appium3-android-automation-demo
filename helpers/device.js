import { Logger} from "./logger.js";

//Initiliaze the logger class in here.
const logger = new Logger("info");

// Device information utilities
export class DeviceInfo {
    constructor(driver) {
        this.driver = driver;
        this.utils = new AppiumUtils(driver);
    }

    async getCompleteDeviceInfo() {
        logger.info('Gathering complete device information...');

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

            logger.info('Device info collected:', JSON.stringify(deviceInfo, null, 2));
            return deviceInfo;

        } catch (error) {
            logger.info(`Device info collection failed: ${error.message}`);
            return deviceInfo;
        }
    }
}