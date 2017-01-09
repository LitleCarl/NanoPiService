var wiringPi = require('./addon.node');
module.exports = function(eventEmitter){
	// WIFI模式切换开关初始化
	var switchStatus = null;
	// Wifi/AP功能切换引脚
	var wifi_ap_switch_pin = 4;
	// 引脚上拉读取数据
	wiringPi.pullUpDnControl(wifi_ap_switch_pin, wiringPi.constValues.pullResistor.PUD_UP);
	// 输入模式
	wiringPi.pinMode(wifi_ap_switch_pin, wiringPi.constValues.pinMode.INPUT);
	setInterval(function(){
		var value = wiringPi.digitalRead(wifi_ap_switch_pin);
		if (switchStatus != value) {
			switchStatus = value;
			console.log('开关状态:', !!value);
			eventEmitter.emit('WIFI_MODE_CHANGE', switchStatus)
		}
	}, 2000);
}
