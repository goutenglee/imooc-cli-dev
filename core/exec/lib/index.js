"use strict";

const path = require("path");
const cp = require("child_process");

const Package = require("@imooc-cli-dev/package");
const log = require("@imooc-cli-dev/log");

const SETTINGS = {
  init: "@imooc-cli-dev/init",
};

const CACHE_DIR = "dependencies";

let pkg;

async function exec() {
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

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      await pkg.update();
    } else {
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    try {
      require(rootFile).call(null, Array.from(arguments));
      const code = "";
      const child = cp.spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (e) => {
        log.error(e.message);
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.verbose("命令执行成功：" + e);
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    }
  }
}

module.exports = exec;
