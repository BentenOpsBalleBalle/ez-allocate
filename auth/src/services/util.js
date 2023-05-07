import { readFileSync } from "node:fs";

/**
 * loads private key (and public for the other endpoint) from docker secrets
 * when the container is started. if no secret is found (aka exception is
 * raised) then no environment variable is updated since its assumed that you
 * must be in a non docker development environment
 */
export function loadPrivateKey() {
    try {
        const key = readFileSync("/var/run/secrets/jwt_private_key", "utf8");
        process.env.PRIVATE_KEY = key;
        console.log("loaded secret private key");
    } catch (err) {
        console.log(err);
        console.warn("using default private key, secret not found");
    }
    try {
        process.env.PUBLIC_KEY = readFileSync("/var/run/secrets/jwt_public_key", "utf8");
        console.log("also loaded public key");
    } catch (error) {}
}
