var Logger = require('./index.js'),
    basicFormat = require('./lib/messages').basic;

var globalLogger = Logger.getGlobal();

globalLogger.getParent().setLevel(Logger.Level.ALL);

globalLogger.severe("OPERATIONAL!");

var testLogger = Logger.getLogger('test');

var basicFormatter = new Logger.Formatter();

basicFormatter.format = function(record) {
  var msg = this.formatMessage(record);
  return basicFormat('[{0,date,full}] ({1}.{2}) {3}',[new Date(record.getMillis()),record.getSourceClassName(),record.getSourceMethodName(),msg]);
}

testLogger._log = function() {
  Logger.prototype._log.apply(this,arguments);
  setTimeout(function(record){
    console.info(basicFormatter.format(record));
  },100,arguments[0])
}

testLogger.setLevel(Logger.Level.ALL);

testLogger.entering("Someplace","Nearby");
testLogger.entering("Someplace","Nearby","Today");
testLogger.entering("Someplace","Nearby",["Today","Yesterday","Tomorrow"]);
testLogger.exiting("Someplace","Nearby",true);
testLogger.severe("test");