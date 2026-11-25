"use strict";

/**
 * One-time installer for the Civic AI Assistant. Safe to run more than once.
 *   node scripts/install-civic-ai.js
 * It (1) mounts the assistant routes in server.js, just before the 404 handler,
 * and (2) adds an `npm test` script to package.json. A backup of server.js is saved
 * as server.js.bak-civic-ai the first time.
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverPath = path.join(root, "server.js");
const packagePath = path.join(root, "package.json");

let server = fs.readFileSync(serverPath, "utf8");
const eol = server.includes("\r\n") ? "\r\n" : "\n";

if (server.includes("routes/mountCivicAi")) {
  console.log("server.js already mounts the Civic AI Assistant. Nothing to change.");
} else {
  const anchor = /\/\/ =+\r?\n\/\/ 404 HANDLER\r?\n\/\/ =+/;
  const match = server.match(anchor);

  if (!match) {
    console.error("Could not find the '404 HANDLER' section in server.js.");
    console.error('Add this line yourself, BEFORE the 404 handler:\n  require("./routes/mountCivicAi")(app, { protect });');
    process.exit(1);
  }

  const bar = "// ======================================================";
  const block = [
    bar,
    "// CIVIC AI ASSISTANT  (/api/ai/*)",
    bar,
    "",
    'require("./routes/mountCivicAi")(app, { protect });',
    "",
    "",
    "",
  ].join(eol);

  fs.copyFileSync(serverPath, `${serverPath}.bak-civic-ai`);
  server = server.replace(match[0], block + match[0]);
  fs.writeFileSync(serverPath, server);
  console.log("Mounted the Civic AI Assistant in server.js (backup: server.js.bak-civic-ai).");
}

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.scripts = pkg.scripts || {};
if (!pkg.scripts.test) {
  pkg.scripts.test = 'node --test "tests/*.test.js"';
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('Added "test" script to package.json.');
}
