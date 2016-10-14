const LogRecord = require('./record');

function LogFilter(func) {
  if((func instanceof Function) && func.length===1) {
    this.isLoggable = func;
  }
}

LogFilter.prototype = {
  isLoggable:function(record) {
    return record instanceof LogRecord;
  }
}

module.exports = LogFilter;