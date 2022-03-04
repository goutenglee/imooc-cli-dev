"use strict";

const fs = require("fs");

const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");

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
      const projectInfo = await this.prepare();

      if (projectInfo) {
        this.downloadTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  downloadTemplate() {}

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
    let projectInfo = {};

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
      const projectSetting = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          default: "",
          validate: function (v) {
            const done = this.async();

            setTimeout(function () {
              // prettier-ignore
              if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                done("请输入合法名称：只能使用英文、数字、和连接符-或_，必须以字母开头");
                return;
              }

              done(null, true);
            }, 0);
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
            const done = this.async();

            setTimeout(function () {
              if (!semver.valid(v)) {
                done("请输入合法版本号");
                return;
              }

              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          },
        },
      ]);
      projectInfo = { type, ...projectSetting };
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
