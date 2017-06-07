const _ = require('lodash');
const async = require('async')
var io = require('socket.io')();
//var phone = io.of('/phone');

// 获取IP地址
var os=require('os');
var iface = os.networkInterfaces()['wlan0'];

var restify = require('restify');

var bodyParser = require('body-parser')
var express = require('express');
// 电机
var asyncMotorAddon = require('./asyncMotorAddon');
asyncMotorAddon.initializeMotor(15, 16, 0, 2, 5.625, 64.0, 1500)

module.exports = {
	init: function() {

	},

	http: function () {
		var app = express();
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(express.static(__dirname + '/public'));

		app.get('/runMotor', function (req, res) {
			var angle = Number(req.query['angle']);
			if (_.isNaN(angle) || !_.isNumber(angle)) {
				res.status(500).json({code: true, message: 'angle参数错误'})
			}
			else {
				var status = asyncMotorAddon.runMotorAsync(angle, function(msg){
				});
				res.status(status == 1? 200 : 500).json({code: status == 1, data:
					{
						predictTime: angle/5.625 * 64 * 1500 / 1000 // 预测执行时间单位为ms
					}
				})
			}
		});

		app.get('/wetSensors', function (req, res) {
			var tasks = [];
			console.log('on wet Request');

			if (iface && iface[0] && iface[0]['address']) {
				var baseAddress = iface[0]['address'].split('.');
				var localIPLast = baseAddress.pop();
				baseAddress = baseAddress.join('.');

				_.forEach([localIPLast], function(ip){ //TODO 下流的NanoPi的URL
					tasks.push(function (taskCB) {
						var client = restify.createJsonClient({
							url: "http://"+baseAddress+'.'+ip+':8802',
							version: '*'
						});

						client.get('/wetAndImage', function (err, _req, _res, obj) {
							taskCB(err, obj);
						});
					});
				});

				async.parallel(tasks, function (err, results) {
					var status = (err == null) ? 200 : 500;

					res.status(status).json({code: err == null, data: results, message: err})
				})
			}
			else {
				res.status(500).json({code: 0, message: 'NanoPi Ip数据获取失败'})
			}
		});
		app.listen(8801);



		// 视频终端需要运行以下代码
		var bodyParserForQueryImageAndWet = require('body-parser')
		var queryImageAndWet = express();
		queryImageAndWet.use(bodyParserForQueryImageAndWet.urlencoded({ extended: false }));
		queryImageAndWet.use(bodyParserForQueryImageAndWet.json());
		queryImageAndWet.use(express.static(__dirname + '/public'));

		queryImageAndWet.get('/wetAndImage', function (req, res) {
			var baseAddress = iface[0]['address'].split('.');
			baseAddress.pop();
			baseAddress = baseAddress.join('.');

			res.status(200).json({code: true, message: null, data: {}, nanoPiAddress: iface[0]['address']})

			//var client = restify.createJsonClient({
			//	url: "http://"+baseAddress+'.5',//Todo NodeMCU的URL
			//	version: '*'
			//});
            //
			//client.get('/', function (err, _req, _res, obj) {
			//	console.log('Server returned: %j', obj);
			//	var imgName = Date.parse(new Date()).toString() + '.jpg';
			//	var imgPath = __dirname + '/public/' + imgName;
			//	//process.nextTick(function () {
			//	//	// 拍照
			//	//	// TODO 检查文件大小删除缓存
			//	//	v4l2Module.L4V2Library.captureFromV4L2(imgPath);
			//	//});
			//	var status = (err == null) ? 200 : 500;
			//	res.status(status).json({code: err == null, message: err, data: obj, nanoPiAddress: iface[0]['address']})
			//});

		});
		queryImageAndWet.listen(8802);

	}
};