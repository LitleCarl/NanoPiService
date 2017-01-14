/**
 * Created by Tsao on 2017/1/13.
 */
const wiringPi = require('addon');
const propertyValues = {
    "人体探测" : null
};
const eventEmitter = new (require('events'))();

module.exports = {
  "人体探测": {
      "subscribe": function (socket, cb) {
          cb(propertyValues['人体探测']);
          var emitterCallback = function () {
              cb(propertyValues['人体探测']);
          };
          eventEmitter.on('人体探测', emitterCallback);
          socket.on('disconnect', function () {
              eventEmitter.removeListener('人体探测', emitterCallback);
          })
      },
      "set": function () {
          return console.log('人体探测', 'is not writable');
      }
  }
};

wiringPi.wiringPiSetup();

(function HumanDetect(){
    // 人体红外探测使用的数据引脚
    var infrared_pin = 7;
    // 引脚上拉读取数据
    wiringPi.pullUpDnControl(infrared_pin, wiringPi.constValues.pullResistor.PUD_UP);
    // 输入模式
    wiringPi.pinMode(infrared_pin, wiringPi.constValues.pinMode.INPUT);
    setInterval(function(){
        var value = wiringPi.digitalRead(infrared_pin);
        if (propertyValues['人体探测'] != value) {
            propertyValues['人体探测'] = value;
            console.log('人体红外状态更新: ', value);
            eventEmitter.emit("人体探测");
        }
    }, 500);
})();