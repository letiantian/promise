var Promise = require('../promise');

var pro = Promise.resolve();
for (var i = 0; i < 10; i++) {
  pro = pro.delay(100).then(function(v){
    console.log('hi');
  });
  console.log('--', pro)
};

/**
 * 这种实现并不合理，因为是先生成所有的Promise，再依次执行里面的任务，如果是死循环，直接内存不足
 */