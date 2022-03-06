"use strict";

const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");

function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npm.taobao.org";
}

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }

  // XXX 后面要把这个去掉，现在这样做是因为 npm 上没有 @imooc-cli-beta 这个包
  npmName = "@imooc-cli/core";

  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);

  return axios
    .get(npmInfoUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return null;
    })
    .catch((err) => {
      // XXX 这个返回的信息太多太长了，简化掉
      // return Promise.reject(err);
      console.log("get-npm-info axios err");
    });
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getNpmSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => {
      semver.satisfies(version, `^${baseVersion}`);
    })
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmLastVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getNpmSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}

async function getNpmLastestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmLastVersion,
  getDefaultRegistry,
  getNpmLastestVersion,
};
