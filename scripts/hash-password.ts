/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Generate a scrypt password hash for the app's HTTP Basic Auth gate.
//
//   npm run hash-password -- "your-password"
//
// Prints a "saltHex:keyHex" string. Store it as the AUTH_PASSWORD_HASH secret
// (e.g. `fly secrets set AUTH_PASSWORD_HASH="<output>"`) — never commit it or
// the plaintext password.

import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "<password>"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const key = crypto.scryptSync(password, salt, 64).toString("hex");
console.log(`${salt}:${key}`);
