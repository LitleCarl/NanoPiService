var wiringPi = require('./modules/addon.node');
var wifiMode = require('./modules/wifi_mode.js');
var frpc = require('./modules/frpc.js');
// Wifi 账号密码设置
var wifiConfigSetting = require('./modules/setting/setting');
const EventEmitter = require('events');

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

// 初始化wiringPi
wiringPi.wiringPiSetup();
const globalEventEmitter = new EventEmitter();
frpc();
////////////////////////////// wifi模式开关切换 Start /////////////////////////////////

var WIFI_SWITCH_LOCKED = false;
var latestMode = require('fs').readFileSync('/sys/module/bcmdhd/parameters/op_mode', {encoding: "utf-8"})[0] != "0";
globalEventEmitter.on('WIFI_MODE_CHANGE', function(value) {
	if (latestMode == value) {
		return;
	}
	latestMode = value;
	if (!WIFI_SWITCH_LOCKED) {
		WIFI_SWITCH_LOCKED = true;
		(function SwitchWifiMode(){
			var util  = require('util'),
		    spawn = require('child_process').spawn,
		    ls    = spawn('sudo', ['turn-wifi-into-apmode', latestMode ? "yes" : "no"]); // the second arg is the command 

			ls.stdout.on('data', function (data) {    // register one or more handlers
			  console.log('stdout: ' + data);
			});

			ls.stderr.on('data', function (data) {
			  console.log('stderr: ' + data);
			});

			ls.on('exit', function (code) {
			  console.log('child process exited with code ' + code);
			  // 模式切换完成，检查是否与当前最新的模式一致，不一致则继续切换

			  function TransferModeInFile(opModeInFile) {
			  	return opModeInFile != "0";
			  }
			  // 模式切换完成，检查是否与当前最新的模式一致，不一致则继续切换
			  if (TransferModeInFile(require('fs').readFileSync('/sys/module/bcmdhd/parameters/op_mode', {encoding: "utf-8"})[0]) != latestMode){
			  		SwitchWifiMode();
			  }
			  else {
			  	// 释放锁
			  	WIFI_SWITCH_LOCKED = false;
			  }
			});
		})();
	}
});

wifiMode(globalEventEmitter);

////////////////////////////// wifi模式开关切换 End /////////////////////////////////

////////////////////////////// Wifi Client模式账户密码修改模式 Start /////////////////////////////////
wifiConfigSetting();
////////////////////////////// Wifi Client模式账户密码修改模式 End /////////////////////////////////






