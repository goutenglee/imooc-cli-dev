"use strict";

const fs = require("fs");
const path = require("path");

const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");
const userHome = require("user-home");

const Command = require("@imooc-cli-beta/command");
const Package = require("@imooc-cli-beta/package");
const log = require("@imooc-cli-beta/log");
const { spinnerStart, sleep } = require("@imooc-cli-beta/utils");

const getProjectTemplate = require("./getProjectTemplate");

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
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  async downloadTemplate() {
    const templateName = this.projectInfo.projectTemplate;
    const templateInfo = this.projectTemplate.find(
      (item) => (item.name = templateName)
    );

    const targetPath = path.resolve(userHome, ".imooc-cli", "template");
    const storePath = path.resolve(targetPath, "node_modules");

    const { npmName, version } = templateInfo;

    const templateNpm = new Package({
      targetPath,
      storePath,
      packageName: npmName,
      packageVersion: version,
    });

    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart("正在下载模板...");
      await sleep();
      await templateNpm.install();
      spinner.stop(true);
      log.info("下载模板成功");
    } else {
      const spinner = spinnerStart("正在更新模板...");
      await sleep();
      await templateNpm.update();
      spinner.stop(true);
      log.info("更新模板成功");
    }
    // zzz
    console.log(templateNpm);
  }

  async prepare() {
    const projectTemplate = await getProjectTemplate();
    if (!projectTemplate || projectTemplate.length === 0) {
      throw new Error("项目模板不存在");
    }
    this.projectTemplate = projectTemplate;

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
        {
          type: "list",
          name: "projectTemplate",
          message: "请选择要下载的模板",
          choices: this.createTemplateChoices(),
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

  createTemplateChoices() {
    return this.projectTemplate.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
