#!/usr/bin/env node

const imporeLocal = require("import-local");

if (imporeLocal(__filename)) {
  require("npmlog").info("cli", "正在使用本地 imooc-cli-dev");
} else {
  require("../lib/core.js")(process.argv.slice(2));
}
