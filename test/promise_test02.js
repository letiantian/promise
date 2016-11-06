var Promise = require('../promise');

var getData100 = function(){
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve('100ms');
		},100);
	});
}

var getData200 = function(){
	return new Promise(function(resolve,reject){    // 这里的resolve和reject其实是为为了改变Promise状态和执行下一步（Promise内部实现）
		setTimeout(function(){
			reject('200ms');
		},200);
	});
}

getData100().then(function(data) {
  console.log(data);
});

getData200().then(function(data) {
  console.log('--', data);
}).catch(function(err) {
  console.log('++', err);
});;
