var LogFilter = require('./filter'),
    LogFormatter = require('./formatter'),
    LogErrorManager = require('./errormanager'),
    LogRecord = require('./record'),
    LogLevel = require('./level');

function addGetterSetterMethods(obj,variableName,name,cls,proto) {
  var data = this;
  var vName = variableName;
  var props = {};
  var Class = cls;
  
  function check(val) {
    if(Class===String) return typeof(val)=="string";
    if(Class===Boolean) return typeof(val)=="boolean";
    if(Class===Number) return typeof(val)=="number";
    return typeof(Class)=="function"?(val instanceof Class):false;
  }
  
  props["get"+name]={
    configurable:proto===true,
    writable:false,
    enumerable:true,
    value:function() {
      return data[vName];
    }
  };
  props["set"+name]={
    configurable:proto===true,
    writable:false,
    enumerable:true,
    value:function(val) {
      if(check(val) || val===null) {
        data[vName]=val;
      }
      return this;
    }
  };
  Object.defineProperties(obj,props);
}

function LoggerHandler() {
  var data = {
    encoding: 'utf8',
    errorManager: new LogErrorManager(),
    filter: null,
    formatter: null,
    level: LogLevel.ALL
  };
  var addGSMthds = addGetterSetterMethods.bind(data);
  
  addGSMthds(this,'encoding','Encoding',String);
  addGSMthds(this,'errorManager','ErrorManager',LogErrorManager);
  addGSMthds(this,'filter','Filter',LogFilter);
  addGSMthds(this,'formatter','Formatter',LogFormatter);
  addGSMthds(this,'level','Level',LogLevel);
}

var addProto = addGetterSetterMethods.bind(null);
  addProto(LoggerHandler.prototype,'encoding','Encoding',String,true);
  addProto(LoggerHandler.prototype,'errorManager','ErrorManager',LogErrorManager,true);
  addProto(LoggerHandler.prototype,'filter','Filter',LogFilter,true);
  addProto(LoggerHandler.prototype,'formatter','Formatter',LogFormatter,true);
  addProto(LoggerHandler.prototype,'level','Level',LogLevel,true);
  
  Object.defineProperty(LoggerHandler.prototype,'reportError',{
    writable:false,
    enumerable:true,
    value:function(msg,err,code) {
      try {
        var errorManager = this.getErrorManager();
        errorManager.error(msg,err,code);
      } catch(err) {}
    }
  });

LoggerHandler.prototype.close = function() {};
LoggerHandler.prototype.flush = function() {};
LoggerHandler.prototype.isLoggable = function(record) {
  if(record===null || !(record instanceof LogRecord)) {
    return false;
  }
  var filter = this.getFilter();
  return record.getLevel().intValue()>=this.getLevel().intValue() && ((filter instanceof LogFilter)?filter.isLoggable(record):true)
};
LoggerHandler.prototype.publish = function(record) {};

module.exports = LoggerHandler;