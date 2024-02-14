const fs = require("fs");
const semver = require("semver");

try {
  const packageJsonPath = "package.json";
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const parameter = process.argv[2] || "patch";
  console.log(`\x1b[33mBumping version: \x1b[43m ${parameter} \x1b[0m`);

  const currentVersion = packageJson.version || "0.0.0";
  const newVersion = semver.inc(currentVersion, parameter);
  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  );

  console.log(
    `\x1b[32m>>> Version updated from ${currentVersion} to \x1b[42m ${newVersion} \x1b[0m`
  );
} catch (e) {
  console.error(e);
  process.exit(1);
}
