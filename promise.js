(function(){

var PENDING = 'PENDING', FULFILLED = 'FULFILLED', REJECTED = 'REJECTED';

var isFunction = function(obj){
  return 'function' === typeof obj;
}
var isArray = function(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
var isThenable = function(obj){
  return obj && typeof obj['then'] == 'function';
}

// 状态转变
var transition = function(status, value){
  var promise = this;
  if(promise._status !== PENDING) 
    return;
  setTimeout(function(){  // 所有的执行都是异步调用，保证then是先执行的
    promise._status = status;
    publish.call(promise, value);
  });
}

// 状态转变触发下一步函数执行
var publish = function(val){
  var promise = this,
      fn,
      st = promise._status === FULFILLED,
      queue = promise[st ? '_resolves' : '_rejects'];  // 当前状态对应的队列
    
  while(fn = queue.shift()) {
    val = fn.call(promise, val) || val;
  }
  promise[st ? '_value' : '_reason'] = val;
  promise['_resolves'] = promise['_rejects'] = undefined;
}

// Promise
var Promise = function(resolver){
  if (!isFunction(resolver))
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  if(!(this instanceof Promise))    // 保证是对象，而非函数形式调用Promise
    return new Promise(resolver);

  var promise = this;
  promise._value;
  promise._reason;
  promise._status = PENDING;
  promise._resolves = [];
  promise._rejects = [];
  
  var resolve = function(value){
    transition.apply(promise,[FULFILLED, value]);
  }
  var reject = function(reason){
    transition.apply(promise,[REJECTED, reason]);
  }
  
  resolver(resolve, reject);
}

// Promise.prototype.then
Promise.prototype.then = function(onFulfilled,onRejected){
  var promise = this;
  // 每次返回一个promise，保证是可thenable的
  return Promise(function(resolve,reject){
    function callback(value){
      var ret = isFunction(onFulfilled) && onFulfilled(value) || value; // if (isFunction(onFulfilled)) ret = onFulfilled(value); else ret = value;
      if(isThenable(ret)){
        ret.then(function(value){
            resolve(value);
        },function(reason){
            reject(reason);
        });
      }else{
        resolve(ret);
      }
    }
    
    function errback(reason){
      reason = isFunction(onRejected) && onRejected(reason) || reason; // if (isFunction(onRejected)) ret = onRejected(reason); else ret = reason;
      reject(reason);
    }

    if(promise._status === PENDING){
      promise._resolves.push(callback);
      promise._rejects.push(errback);
    }else if(promise._status === FULFILLED){ // 状态改变后的then操作，立刻执行
      callback(promise._value);
    }else if(promise._status === REJECTED){
      errback(promise._reason);
    }
  });
}

// Promise.prototype.catch
Promise.prototype.catch = function(onRejected){
  return this.then(undefined, onRejected)
}


// Promise.prototype.delay
Promise.prototype.delay = function(ms, val){
  return this.then(function(ori){
    return Promise.delay(ms, val || ori);   // 不要用new
  })
}

// Promise.delay
Promise.delay = function(ms,val){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve(val);
    },ms);
  })
}

// Promise.resolve
Promise.resolve = function(arg){
  return new Promise(function(resolve, reject){
    resolve(arg)
  })
}

// Promise.reject
Promise.reject = function(arg){
  return new Promise(function(resolve, reject){
    reject(arg)
  })
}

// Promise.all
Promise.all = function(promises){
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }
  return new Promise(function(resolve, reject){
    var i = 0,
        result = [],
        len = promises.length,
        count = len;

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function rejecter(reason){
      reject(reason);
    }

    function resolveAll(index, value){
      result[index] = value;
      if( --count == 0){
        resolve(result)
      }
    }

    for (; i < len; i++) {
      promises[i].then(resolver(i), rejecter);
    }
  });
}

// Promise.race
Promise.race = function(promises){
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject){
    var i = 0,
        len = promises.length;

    function resolver(value) {
      resolve(value);
    }

    function rejecter(reason){
      reject(reason);
    }

    for (; i < len; i++) {
      promises[i].then(resolver, rejecter);
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = Promise;
} else {
  this.Promise = Promise;
}

})();  // end