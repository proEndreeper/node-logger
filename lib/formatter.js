var LogRecord = require('./record'),
    util = require('util');

var basicFormat = require('./utilities').format;

function LogFormatter() {}

LogFormatter.prototype.format= function(record) {
  return this.formatMessage(record);
},
LogFormatter.prototype.getHead= function(handler) {
  return "";
},
LogFormatter.prototype.getTail=function(handler) {
  return "";
},
LogFormatter.prototype.formatMessage= function(record) {
  var message = record.getMessage();
  if(record.getParameters().length<1 || message.indexOf("{0")==-1) {
    return message;
  }
  return basicFormat(message,record.getParameters());
};

module.exports = LogFormatter;