"use strict";

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

function spinnerStart(msg, spinnerString = "|/-\\") {
  var Spinner = require("cli-spinner").Spinner;

  var spinner = new Spinner(msg + " %s");
  spinner.setSpinnerString(spinnerString);
  spinner.start();

  return spinner;
}

function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = {
  isObject,
  spinnerStart,
  sleep,
};
