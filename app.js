var wiringPi = require('./modules/addon.node');
var wifiMode = require('./modules/wifi_mode.js');
var frpc = require('./modules/frpc/index.js');
// Wifi 账号密码设置
//var wifiConfigSetting = require('./modules/setting/index');

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

// SocketIO对外信息同步
//require('./modules/socket')['init'](globalEventEmitter);
require('./modules/socket')['http']();

// 端口映射
frpc();

// WIFI模式切换服务
wifiMode(globalEventEmitter);

////////////////////////////// Wifi Client模式账户密码修改模式 HTTP服务，PORT: 3000 /////////////////////////////////
//wifiConfigSetting();






