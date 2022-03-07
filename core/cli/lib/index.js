"use strict";
const path = require("path");

const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
console.log("!!!!!!!!!!!!!!!!!!!!!!", userHome);
const pathExists = require("path-exists").sync;
const commander = require("commander");

const pkg = require("../package.json");
const constant = require("./const");
const log = require("@imooc-cli-beta/log");
const exec = require("@imooc-cli-beta/exec");

const program = new commander.Command();

module.exports = core;

async function core() {
  try {
    await prepare();
    registerCommander();
  } catch (e) {
    if (process.env.LOG_LEVEL === "verbose") {
      console.log(e);
    } else {
      log.error(e.message);
    }
  }
}

async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  // checkInputArgs();
  checkEnv();
  await checkGlobalUpdate();
}

function registerCommander() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<cmd> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program._optionValues.targetPath;
  });

  program.on("option:debug", function () {
    if (program._optionValues.debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }

    log.level = process.env.LOG_LEVEL;
  });

  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());

    console.log(colors.red(`未知的命令：${obj[0]}`));

    if (availableCommands.length > 0) {
      console.log(colors.red(`可用命令：${availableCommands.join(", ")}`));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmLastVersion } = require("@imooc-cli-beta/get-npm-info");
  const lastVersion = await getNpmLastVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "更新提示",
      colors.yellow(`
      请手动更新 ${npmName}
      当前版本 ${currentVersion}
      最新版本 ${lastVersion}
      更新命令 npm install -g ${npmName}
    `)
    );
  }
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
  }
  creatDefaultConfig();
}

function creatDefaultConfig() {
  const cliConfig = {
    home: userHome, // -> '/users/sam'
  };

  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    // constant.DEFAULT_CLI_HOME -> '.imooc-cli'
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  // cliConfig.cliHome -> '/user/sam/.imooc-cli'
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// function checkInputArgs() {
//   const minimist = require("minimist");
//   args = minimist(process.argv.slice(2));
//   checkArgs();
// }

// function checkArgs() {
//   if (args.debug) {
//     process.env.LOG_LEVEL = "verbose";
//   } else {
//     process.env.LOG_LEVEL = "info";
//   }
//   log.level = process.env.LOG_LEVEL;
// }

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
