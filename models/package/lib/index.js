"use strict";

const path = require("path");

const pkgDir = require("pkg-dir").sync;
const { installLocal } = require("npminstall");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");

const { isObject } = require("@imooc-cli-beta/utils");
const formatPath = require("@imooc-cli-beta/format-path");
const {
  getDefaultRegistry,
  getNpmLastestVersion,
} = require("@imooc-cli-beta/get-npm-info");
// XXX log 好像出错了
const { log } = require("console");

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
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      fse.mkdirpSync(this.storePath);
    }

    if (this.packageVersion === "lastest") {
      this.packageVersion = await getNpmLastestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    );
  }

  async exists() {
    if (this.storePath) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }

  async install() {
    await this.prepare();
    return installLocal({
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

  async update() {
    const preUpdatePackageVersion = this.packageVersion;
    await this.prepare();
    const lastestPackageVersion = await getNpmLastestVersion(this.packageName);
    const lastestFilePath = this.getSpecificCacheFilePath(
      lastestPackageVersion
    );
    if (!pathExists(lastestFilePath)) {
      await installLocal({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: lastestPackageVersion,
          },
        ],
      });
      this.packageVersion = lastestFilePath;
      console.log(
        `已将${this.packageName}从${preUpdatePackageVersion}更新至${lastestFilePath}`
      );
    }
  }

  getRootFilePath() {
    const _getRootFile = function (p) {
      const dir = pkgDir(p);
      if (dir) {
        const pkgFile = require(path.resolve(dir, "package.json"));
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
        return null;
      }
    };

    if (this.storePath) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
