#!/usr/bin/env node

const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "正在使用本地 imooc-cli-beta");
} else {
  require("../lib/core.js")(process.argv.slice(2));
}
