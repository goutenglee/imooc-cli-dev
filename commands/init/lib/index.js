"use strict";

const fs = require("fs");

const inquirer = require("inquirer");

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

  async exec() {
    try {
      await this.prepare();
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {}

  iSCwdEmpty() {
    const localPath = process.cwd();
    let fileList = fs.readFileSync(localPath);
    fileList = fileList.filter((file) => {
      !file.startWith(".") && ["node_modules"].indexOf(file) < 0;
    });
    return !fileList || fileList.length <= 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
