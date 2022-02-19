"use strict";

const path = require("path");

const Package = require("@imooc-cli-dev/package");
const log = require("@imooc-cli-dev/log");

const SETTINGS = {
  init: "@imooc-cli-dev/init",
};

const CACHE_DIR = "dependencies";

function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  let storeDir = "";
  const homePath = process.env.CLI_HOME_PATH;

  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "lastest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
  }

  const pkg = new Package({
    targetPath,
    storeDir,
    packageName,
    packageVersion,
  });

  // XXX
  console.log(pkg);
  pkg.getRootFilePath();
}

module.exports = exec;
