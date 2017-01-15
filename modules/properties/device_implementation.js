/**
 * Created by Tsao on 2017/1/13.
 */
const wiringPi = require('./addon');
const propertyValues = {};
const eventEmitter = new (require('events'))();
const PropertyNames = {
    Infrared: "人体探测"
};
wiringPi.constValues = {
    pinMode: {
        "INPUT": 0,
        "OUTPUT": 1
    },

    pinValue: {
        "LOW": 0,
        "HIGH": 1
    },
    pullResistor: {
        "PUD_OFF": 0,
        "PUD_DOWN": 1,
        "PUD_UP": 2
    }
};

module.exports = {
  "人体探测": {
      "subscribe": function (socket, cb) {
          cb(propertyValues[PropertyNames.Infrared]);
          var emitterCallback = function () {
              cb(propertyValues[PropertyNames.Infrared]);
          };
          eventEmitter.on('人体探测', emitterCallback);
          socket.on('disconnect', function () {
              eventEmitter.removeListener(PropertyNames.Infrared, emitterCallback);
          })
      },
      "set": function () {
          return console.log(PropertyNames.Infrared, 'is not writable');
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
        if (propertyValues[PropertyNames.Infrared] != value) {
            propertyValues[PropertyNames.Infrared] = value;
            console.log('人体红外状态更新: ', value);
            eventEmitter.emit(PropertyNames.Infrared);
        }
    }, 500);
})();