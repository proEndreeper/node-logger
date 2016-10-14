var util = require('util');
const Level = require('./level');

var seqNo = Number.MIN_SAFE_INTEGER;

function getSequenceNumber() {
  if(seqNo==Number.MAX_SAFE_INTEGER) {
    seqNo=Number.MIN_SAFE_INTEGER;
  }
  return seqNo++;
}

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

function LogRecord(level,msg) {
  var now = Date.now();
  if(!(level instanceof Level)) {
    throw new TypeError("Invalid parameter: level (Level)!");
  }
  if(typeof(msg)!="string") {
    throw new TypeError("Invalid parameter: msg (String)!");
  }
  var data = {
    level:level,
    message:msg,
    loggerName: null,
    eventTime: now,
    params: [],
    sequence: getSequenceNumber(),
    sourceClassName: null,
    sourceMethodName: null,
    thrown: null
  };
  var addGSMthds = addGetterSetterMethods.bind(data);
  addGSMthds(this,'level','Level',Level);
  addGSMthds(this,'loggerName','LoggerName',String);
  addGSMthds(this,'message','Message',String);
  addGSMthds(this,'eventTime','Millis',Number);
  addGSMthds(this,'params','Parameters',Array);
  addGSMthds(this,'sequence','SequenceNumber',Number);
  addGSMthds(this,'sourceClassName','SourceClassName',String);
  addGSMthds(this,'sourceMethodName','SourceMethodName',String);
  addGSMthds(this,'thrown','Thrown',Error);
}

var addProto = addGetterSetterMethods.bind(null);
  addProto(LogRecord.prototype,'level','Level',Level,true),
  addProto(LogRecord.prototype,'loggerName','LoggerName',String,true),
  addProto(LogRecord.prototype,'message','Message',String,true),
  addProto(LogRecord.prototype,'eventTime','Millis',Number,true),
  addProto(LogRecord.prototype,'params','Parameters',Array,true),
  addProto(LogRecord.prototype,'sequence','SequenceNumber',Number,true),
  addProto(LogRecord.prototype,'sourceClassName','SourceClassName',String,true),
  addProto(LogRecord.prototype,'sourceMethodName','SourceMethodName',String,true),
  addProto(LogRecord.prototype,'thrown','Thrown',Error,true);

module.exports = LogRecord;