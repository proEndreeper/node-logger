var util = require('util'),
    cps = require('cps'),
    LoggerErrorManager = require('./errormanager'),
    LoggerFilter = require('./filter'),
    LoggerFormatter = require('./formatter'),
    LoggerHandler = require('./handler'),
    Level = require('./level'),
    LogRecord = require('./record');

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

function Logger(name) {
  var data = {
    name:name,
    filter:null,
    level:null,
    parent:null,
    useParentHandlers:true,
    handlers:[]
  };
  
  var addGSMthds = addGetterSetterMethods.bind(data);
  addGSMthds(this,'filter','Filter',LoggerFilter);
  addGSMthds(this,'level','Level',Level);
  addGSMthds(this,'parent','Parent',Logger);
  addGSMthds(this,'useParentHandlers','UseParentHandlers',Boolean);
  
  Object.defineProperties(this,{
    getName: {
      enumerable:true,
      writable:false,
      value: function() {
        return data.name;
      }
    },
    getHandlers: {
      enumerable:true,
      writable:false,
      value:function() {
        return data.handlers.slice();
      }
    },
    addHandler: {
      enumerable:true,
      writable:false,
      value:function(handler) {
        if(!(handler instanceof LoggerHandler)) {
          throw new TypeError("Invalid parameter: handler (Handler)!");
        }
        if(data.handlers.indexOf(handler)>-1) {
          return;
        }
        data.handlers.push(handler)
      }
    },
    removeHandler: {
      enumerable:true,
      writable:false,
      value:function(handler) {
        if(handler===null || !(handler instanceof LoggerHandler)) {
          return;
        }
        var ind = data.handlers.indexOf(handler);
        if(ind>-1) {
          data.handlers.splice(ind,1);
        }
      }
    }
  })
}

var addProto = addGetterSetterMethods.bind(null);
  addProto(Logger.prototype,'filter','Filter',LoggerFilter,true);
  addProto(Logger.prototype,'level','Level',Level,true);
  addProto(Logger.prototype,'parent','Parent',Logger,true);
  addProto(Logger.prototype,'useParentHandlers','UseParentHandlers',Boolean,true);

Logger.prototype.isLoggable= function(level) {
  if(!(level instanceof Level)) {
    return false;
  }
  var par = this;
  var myLevel = par.getLevel();
  while((myLevel = par.getLevel())===null && (par = par.getParent())!==null) {}
  if(myLevel===null) myLevel = Level.ALL;
  var sV = myLevel.intValue(), oV = level.intValue();
  return oV>=sV;
};
Logger.prototype._log= function(record) {
  if(!(record instanceof LogRecord)) {
    throw new TypeError("Invalid parameter: record (LogRecord)!");
  }
  var self = this;
  if(this.isLoggable(record.getLevel())) {
    var handlers = this.getHandlers();
    cps.peach(handlers,function(handler,cb){
      if(!(handler instanceof LoggerHandler)) return cb(null,null);
      if(handler.isLoggable(record)) {
        try {
          handler.publish(record);
        } catch(err) {
          handler.reportError("Failed to publish record!",err,isNaN(err.type)?0:err.type);
        }
      }
      cb(null,null);
    }, function(err,last) {
      if(err) {
        console.warn('An error occurred while logging a record!');
        console.warn(err);
      }
      if(self.getUseParentHandlers()) {
        if(self.getParent() instanceof Logger) {
          self.getParent().log(record);
        }
      }
    });
    
  } 
};
Logger.prototype.log= function() {
  var record = null;
  if((arguments[0] instanceof Level) && typeof(arguments[1])=="string") {
    record = new LogRecord(arguments[0],arguments[1]);
    if(arguments[2] instanceof Error) {
      record.setThrown(arguments[2])
    } else if(util.isArray(arguments[2])) {
      record.setParameters(arguments[2]);
    } else if(arguments[2] instanceof Object) {
      record.setParameters([arguments[2]]);
    }
  } else if(arguments[0] instanceof LogRecord) {
    record = arguments[0];
  }
  if(!(record instanceof LogRecord)) {
    record = new LogRecord(Level.FINEST,"Invalid log request");
    record.setSourceClassName("Logger");
    record.setSourceMethodName("log");
  }
  this._log(record);
};
Logger.prototype.logp= function() {
  var record = null;
  if((arguments[0] instanceof Level) && typeof(arguments[1])=="string" &&
      typeof(arguments[2])=="string" && typeof(arguments[3])=="string") {
    record = new LogRecord(arguments[0],arguments[3]);
    record.setSourceClassName(arguments[1]);
    record.setSourceMethodName(arguments[2]);
    if(arguments[4] instanceof Error) {
      record.setThrown(arguments[4])
    } else if(util.isArray(arguments[4])) {
      record.setParameters(arguments[4]);
    } else if(arguments[4] instanceof Object) {
      record.setParameters([arguments[4]]);
    }
  }
  if(!(record instanceof LogRecord)) {
    record = new LogRecord(Level.FINEST,"Invalid log request");
    record.setSourceClassName("Logger");
    record.setSourceMethodName("logp");
  }
  this._log(record);
};
Logger.prototype.entering= function(sourceClass,sourceMethod,param) {
  var record = new LogRecord(Level.FINER,"ENTRY");
  if(util.isArray(param)) {
    var message = "ENTRY"
    for(var i=0;i<param.length;i++) {
      message+=" {"+i.toString(10)+"}"
    }
    record.setMessage(message);
    record.setParameters(param);
  } else if(param!==undefined) {
    record.setMessage("ENTRY {0}");
    record.setParameters([param]);
  }
  record.setSourceClassName(sourceClass);
  record.setSourceMethodName(sourceMethod);
  this.log(record);
};
Logger.prototype.exiting= function(sourceClass,sourceMethod,result) {
  var record = new LogRecord(Level.FINER,"RETURN");
  if(!util.isArray(result) && (result!==undefined)) {
    record.setMessage("RETURN {0}");
    record.setParameters([result]);
  }
  record.setSourceClassName(sourceClass);
  record.setSourceMethodName(sourceMethod);
  this.log(record);
};
Logger.prototype.throwing= function(sourceClass,sourceMethod,thrown) {
  if(!this.isLoggable(Level.FINER)) return;
  var record = new LogRecord(Level.FINER,"THROW");
  record.setThrown(thrown);
  record.setSourceClassName(sourceClass);
  record.setSourceMethodName(sourceMethod);
  this.log(record);
};

["SEVERE","WARNING","INFO","CONFIG","FINE","FINER","FINEST"].forEach(function(name){
  var lvl = Level[name];
  Logger.prototype[name.toLowerCase()]=function(msg) {
    if(!this.isLoggable(lvl)) return;
    this.log(lvl,msg);
  };
});

Logger.ErrorManager = LoggerErrorManager;
Logger.Filter = LoggerFilter;
Logger.Formatter = LoggerFormatter;
Logger.Handler = LoggerHandler;
Logger.Level = Level;
Logger.Logger = Logger;
Logger.LogRecord = LogRecord;

module.exports = Logger;