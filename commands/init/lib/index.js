"use strict";

const fs = require("fs");

const inquirer = require("inquirer");
const fse = require("fs-extra");

const Command = require("@imooc-cli-dev/command");
const log = require("@imooc-cli-dev/log");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._cmd._optionValues.force;

    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  async exec() {
    try {
      const ret = await this.prepare();
      if (ret) {
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {
    const localPath = process.cwd();

    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;

      if (!this.force) {
        ifContinue = (
          await inquirer.prompt({
            type: "confirm",
            name: "ifContinue",
            default: false,
            message: "当前文件夹不为空，是否强制清空，以继续创建项目？",
          })
        ).ifContinue;

        if (!ifContinue) return;
      }

      if (ifContinue || this.force) {
        const { confirmDelete } = inquirer.prompt({
          type: "confirm",
          name: "confirmDelete",
          default: false,
          message: "确认清空当前文件夹？",
        });

        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }

    return this.getProjectInfo();
  }

  async getProjectInfo() {
    const projectInfo = {};

    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择要初始化的类型",
      default: TYPE_PROJECT,
      choices: [
        { name: "项目", value: TYPE_PROJECT },
        { name: "模板", value: TYPE_COMPONENT },
      ],
    });

    log.verbose("type", type);

    if (type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          default: "",
          validate: function (v) {
            return typeof v === "string";
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目版本号",
          default: "",
          validate: function (v) {
            return typeof v === "string";
          },
          filter: function (v) {
            return v;
          },
        },
      ]);

      // XXX
      console.log(o);
    } else if (type === TYPE_COMPONENT) {
    }

    return projectInfo;
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter((file) => {
      !file.startsWith(".") && ["node_modules"].indexOf(file) < 0;
    });
    return !fileList || fileList.length <= 0;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
