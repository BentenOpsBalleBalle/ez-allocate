import crypto from "crypto";
import util from "util";
const scrypt = crypto.scrypt;
const randomBytes = crypto.randomBytes;
const promisify = util.promisify;
const scryptAsync = promisify(scrypt);

class PasswordManager {
	static async toHash(password) {
		const salt = randomBytes(8).toString("hex");
		const buffer = await scryptAsync(password, salt, 64);
		return `${buffer.toString("hex")}.${salt}`;
	}
	static async compare(storedPassword, suppliedPassword) {
		const [hashedPassword, salt] = storedPassword.split(".");
		const buffer = await scryptAsync(suppliedPassword, salt, 64);

		return buffer.toString("hex") === hashedPassword;
	}
}

export { PasswordManager };
