"use strict";

const Command = require("@imooc-cli-dev/command");

class InitCommand extends Command {}

function init(projectName, cmdObj) {
  // console.log("init", projectName, cmdObj.force, process.env.CLI_TARGET_PATH);
  return new InitCommand();
}

module.exports = init;

module.exports.InitCommand = InitCommand;
