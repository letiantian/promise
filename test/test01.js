var Promise = function() {
  if ( this instanceof Promise ) {
    console.log('对象')
    console.log(this)  // 输出 {}
  }
  else {
    console.log('函数')
    console.log(this)  // 输出一堆东西
  }
}


new Promise();
Promise();