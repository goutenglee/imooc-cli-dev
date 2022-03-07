const request = require("@imooc-cli-beta/request");

module.exports = function () {
  return request({
    url: "/project/template",
  });
};
