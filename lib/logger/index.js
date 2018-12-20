const dateFormat = require("dateformat");
const colors = require("colors");

const Logger = function Logger(name, counter) {
  this._name = name;
  this._counter = counter;
};

Logger.prototype.green = function success(message) {
  console.log(
    `${getDateString()} [${this._name}] - [THREAD: ${this._counter}] ` +
      colors.green("[+] " + message)
  );
};

Logger.prototype.red = function error(message) {
  console.log(
    `${getDateString()} [${this._name}] - [THREAD: ${this._counter}]` +
      colors.red("[x] " + message)
  );
};

Logger.prototype.blue = function won(message) {
  console.log(
    `${getDateString()} [${this._name}] - [THREAD: ${this._counter}]` +
      colors.blue("[$] " + message)
  );
};

Logger.prototype.normal = function info(message) {
  console.log(
    `${getDateString()} [${this._name}] - [THREAD: ${
      this._counter
    }] [#] ${message}`
  );
};

Logger.prototype.yellow = function caution(message) {
  console.log(
    `${getDateString()} [${this._name}] - [THREAD: ${this._counter}] ` +
      colors.yellow("[?] " + message)
  );
};

function getDateString() {
  return "[" + dateFormat(new Date(), "HH:MM:ss.1") + "]";
}

module.exports = function(name, counter) {
  return new Logger(name, counter);
};
