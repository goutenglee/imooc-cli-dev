"use strict";

const Command = require("@imooc-cli-dev/command");
const log = require("@imooc-cli-dev/log");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    // XXX
    this.force = !!this._cmd._optionValues.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log("initd的业务逻辑");
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
