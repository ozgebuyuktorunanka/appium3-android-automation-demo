import { Logger } from "./logger.js";

//We can start the Logger Class for initiliazing.
const logger = new Logger("info");

// This class will generate test datas for some test.
export class TestDataGenerator {
  //Static method
  static generateRandomEmail() {
    try {
      const domains = ["gmail.com", "yahoo.com", "outlook.com", "test.com"];
      const randomString = Math.random().toString(36).substring(2, 8);
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const randomEmail = `test_${randomString}@${domain}`;
      logger.info(
        `This email is generated for use in some test: ${randomEmail}`
      );
      return randomEmail;
    } catch (e) {
      logger.warn(
        `TestDataGenerator Class -> generateRandomEmail -> randomEmail parameter is null.`
      );
      return null;
    }
  }

  static generateRandomPhoneNumber() {
    try {
      const areaCode = Math.floor(Math.random() * 900) + 100;
      const firstThree = Math.floor(Math.random() * 900) + 100;
      const lastFour = Math.floor(Math.random() * 9000) + 1000;
      const randomPhoneNumber = `${areaCode}-${firstThree}-${lastFour}`;
      logger.info(`RandomPhoneNumber is : ${randomPhoneNumber}`);
      return randomPhoneNumber;
    } catch (e) {
      logger.warn(
        `RandomPhoneNumber is not generated please chech the method.`
      );
    }
  }

  static generateRandomString(length = 8) {
    try {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      logger.info(`RandomStringValue is : ${result}`);
      return result;
    } catch (e) {
      logger.warn(
        "Random String Generation process is failed. Please check and control the TestDataGenerator class."
      );
    }
  }

  static generateRandomDate(startYear = 1990, endYear = 2023) {
    try {
      const start = new Date(startYear, 0, 1);
      const end = new Date(endYear, 11, 31);
      const randomTime =
        start.getTime() + Math.random() * (end.getTime() - start.getTime());
      logger.info(`This is a randomTime value : ${randomTime}`);
      return new Date(randomTime);
    } catch (e) {
      logger.warn(
        "Random Date Generation method is failed. Please check the TestDataGenerator Class."
      );
    }
  }
}
