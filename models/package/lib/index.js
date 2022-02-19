"use strict";

const path = require("path");

const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");

const { isObject } = require("@imooc-cli-dev/utils");
const formatPath = require("@imooc-cli-dev/format-path");
const { getDefaultRegistry } = require("@imooc-cli-dev/get-npm-info");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("类Package 的 参数options 不能为空！");
    }

    if (!isObject(options)) {
      throw new Error("类Package 的 参数options 必须为对象！");
    }

    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
  }

  exists() {}

  install() {
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }

  update() {}

  getRootFilePath() {
    const dir = pkgDir(this.targetPath);
    if (dir) {
      const pkgFile = require(path.resolve(dir, "package.json"));
      if (pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main));
      }
      return null;
    }
  }
}

module.exports = Package;
