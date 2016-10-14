var util = require('util');

const ParamRegex = /{(([^{},]+)(,(([^{},]+)(,([^{},]+))?))?)}/g;

const DateFormat = {
  DEFAULT: {
    year:"numeric",
    month:"short",
    day:"numeric"
  },
  SHORT: {
    year:"numeric",
    month:"numeric",
    day:"numeric"
  },
  LONG: {
    year:"numeric",
    month:"long",
    day:"numeric"
  },
  FULL: {
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
  },
};

const TimeFormat = {
  DEFAULT: {
    hour:"2-digit",
    minute:"2-digit"
  },
  SHORT: {
    hour:"numeric",
    minute:"2-digit"
  },
  LONG: {
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
  },
  FULL: {
    hour:"numeric",
    minute:"numeric",
    second:"numeric",
    timeZoneName:"long"
  },
};

const FORMAT_MAP = {
  number:{
    none: function(val) {
      return val.toString(10);
    },
    integer: function(val) {
      return val.toFixed(0);
    },
    currency: function(val) {
      return val.toFixed(2);
    },
    percent: function(val) {
      return (val*100).toString(10);
    }
  },
  date: {
    none: function(date) {
      return date.toLocaleDateString('en-us',DateFormat.DEFAULT)
    },
    short: function(date) {
      return date.toLocaleDateString('en-us',DateFormat.SHORT);
    },
    medium: function(date) {
      return date.toLocaleDateString('en-us',DateFormat.DEFAULT);
    },
    long: function(date) {
      return date.toLocaleDateString('en-us',DateFormat.LONG);
    },
    full: function(date) {
      return date.toLocaleString('en-us',DateFormat.FULL);
    }
  },
  time: {
    none: function(date) {
      return date.toLocaleTimeString('en-us',TimeFormat.DEFAULT)
    },
    short: function(date) {
      return date.toLocaleTimeString('en-us',TimeFormat.SHORT);
    },
    medium: function(date) {
      return date.toLocaleTimeString('en-us',TimeFormat.DEFAULT);
    },
    long: function(date) {
      return date.toLocaleTimeString('en-us',TimeFormat.LONG);
    },
    full: function(date) {
      return date.toLocaleTimeString('en-us',TimeFormat.FULL);
    }
  }
}

function repl() {
  var parameters = this;
  var arr = [];
  arr[0] = arguments[2];
  if(arguments[5]) {
    arr[1] = arguments[5];
  }
  if(arguments[7]) {
    arr[2] = arguments[7];
  }
  var func = function(txt){return txt};
  var key = arr[0];
  var param = parameters[key];
  if(FORMAT_MAP[arr[1]]) {
    var map = FORMAT_MAP[arr[1]];
    var tFunc = arr[2]?map[arr[2]]:map.none;
    if(!tFunc && map.other) {
      tFunc = function(txt) {
        map.other(arr[2],txt);
      };
    }
    func = tFunc;
  } else if(!arr[1] && !arr[2]) {
    return String(param);
  }
  return func(param||arguments[0]);
}

function basicFormat(str,params) {
  if(typeof(str)!="string") {
    throw new TypeError("Invalid parameter: str (String)!");
  }
  if(!util.isArray(params)) {
    throw new TypeError("Invalid parameter: params (Array)!");
  }
  return str.replace(ParamRegex,repl.bind(params));
}

module.exports.basic = basicFormat;