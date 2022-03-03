"use strict";

const path = require("path");
const cp = require("child_process");

const Package = require("@imooc-cli-dev/package");
const log = require("@imooc-cli-dev/log");

// XXX 手动维护的配置表，之后应该会修改成 api 获取
const SETTINGS = {
  init: "@imooc-cli/init",
};

const CACHE_DIR = "dependencies";

let pkg;

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  let storePath = "";
  const homePath = process.env.CLI_HOME_PATH;

  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "lastest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storePath = path.resolve(targetPath, "node_modules");

    pkg = new Package({
      targetPath,
      storePath,
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
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);

      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith("_") &&
          key !== "parent"
        ) {
          o[key] = cmd[key];
        }
      });

      args[args.length - 1] = o;

      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;

      const child = spawn("node", ["-e", code], {
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

function spawn(command, args, options) {
  const win32 = process.platform === "win21";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
