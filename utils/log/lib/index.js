"use strict";

const log = require("npmlog");

// 判断 debug
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";

// 修改前缀
log.heading = "imooc-cli";
// log.headingStyle = { fg: "red", bg: "green" };
// log.addLevel("success", 2000, { fg: "green", bold: true });

module.exports = log;
