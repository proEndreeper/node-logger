var Logger = require('./lib/logger'),
    crypto = require('crypto');

function randId() {
  var shasum = crypto.createHash("sha1");
  shasum.update((Math.random()*Number.MAX_SAFE_INTEGER).toString(16))
  return "anon_"+shasum.digest("hex");
}

var rootLogger = new Logger("");
rootLogger.setLevel(Logger.Level.OFF);

var rootHandler = new Logger.Handler();

rootHandler.setFormatter(new Logger.Formatter());

rootHandler.cache = [];

rootHandler.publish = function(record) {
  var formatter = this.getFormatter();
  
  if(this.isLoggable(record)) {
    var msg = (formatter instanceof Logger.Formatter)?formatter.format(record):record.getMessage();
    process.emitWarning(msg,record.getLevel().getName());
  }
};

rootLogger.addHandler(rootHandler);

var global = null;

var loggers = [];
loggers[""]=rootLogger;

Object.defineProperties(Logger,{
  GLOBAL_LOGGER_NAME: {
    writable:false,
    value: "global"
  },
  getLogger:{
    writable:false,
    value: function(name) {
      if(loggers[name] instanceof Logger) return loggers[name];
      var logger = new Logger(name);
      logger.setParent(loggers[""]);
      logger.setUseParentHandlers(true);
      loggers[name]=logger;
      return logger;
    }
  },
  getGlobal: {
    writable:false,
    value:function() {
      return Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    }
  },
  getAnonymousLogger: {
    writable:false,
    value:function() {
      return new Logger(randId());
    }
  }
});

module.exports = Logger;