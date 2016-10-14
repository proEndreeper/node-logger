function ErrorManager(func) {
  if((func instanceof Function) && func.length==3) {
    this.error = func;
  }
}

const ErrorCodes = ["GENERIC_FAILURE","WRITE_FAILURE","FLUSH_FAILURE","CLOSE_FAILURE","OPEN_FAILURE","FORMAT_FAILURE"]

Object.defineProperties(ErrorManager,{
  GENERIC_FAILURE:{
    writable:false,
    enumerable:true,
    value:0
  },
  WRITE_FAILURE:{
    writable:false,
    enumerable:true,
    value:1
  },
  FLUSH_FAILURE:{
    writable:false,
    enumerable:true,
    value:2
  },
  CLOSE_FAILURE:{
    writable:false,
    enumerable:true,
    value:3
  },
  OPEN_FAILURE:{
    writable:false,
    enumerable:true,
    value:4
  },
  FORMAT_FAILURE:{
    writable:false,
    enumerable:true,
    value:5
  }
});

ErrorManager.prototype = {
  error:function(message,error,code) {
    if(!this._done) { //Default only occurs once
      if(isNaN(code) || code<0 || code>5) {
        code=0;
      }
      Object.defineProperty(this,'_done',{value:true}); // _done doesn't need to be enumerable
      process.emitWarning('An error occurred while logging!',ErrorCodes[code]);
      console.error(message,error);
    }
  }
};

module.exports = ErrorManager;