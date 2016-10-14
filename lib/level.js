const DEFAULT_LEVELS = {
  OFF:Number.MAX_SAFE_INTEGER,
  SEVERE:1000,
  WARNING:900,
  INFO:800,
  CONFIG:700,
  FINE:500,
  FINER:400,
  FINEST:300,
  ALL:0
};

var levels = {};

function Level(name,value) {
  if(typeof(name)!="string" || name.length<1) {
    throw new SyntaxError("Invalid parameter: name (string)!");
  }
  name = name.toUpperCase();
  if(isNaN(value) || value<0) {
    throw new SyntaxError("Invalid parameter: value (unsigned integer)")
  }
  var level = levels[name] || levels[value];
  if(level) {
    return level;
  }
  levels[name]=this;
  levels[value]=this;
  Object.defineProperties(this,{
    getName: {
      enumerable:true,
      writable:false,
      value:function() {
        return name;
      }
    },
    intValue: {
      enumerable:true,
      writable:false,
      value:function() {
        return value;
      }
    },
    toString: {
      enumerable:true,
      writable:false,
      value:function() {
        return name;
      }
    }
  });
}

Level.prototype = {
  getName: function() {
    return this.name;
  },
  intValue: function() {
    return this.value;
  },
  toString: function() {
    return this.getName();
  }
};

Level.parse = function(name) {
  if(typeof(name)!="string" || name.length<1) {
    throw new SyntaxError("Invalid parameter: name (string)!");
  }
  var level = levels[name];
  if(!(level instanceof Level)) {
    if(isNaN(parseInt(name))) {
      return null;
    }
    level = new Level(name,name);
  }
  return level;
}

var name,level;
for(name in DEFAULT_LEVELS) {
  level = new Level(name,DEFAULT_LEVELS[name]);
  Object.defineProperty(Level,name,{
    enumerable:true,
    writable:false,
    value:level
  });
}

module.exports = Level;