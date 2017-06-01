const _ = require('lodash');
const async = require('async')
var io = require('socket.io')();
var phone = io.of('/phone');

// 获取IP地址
var os=require('os');
var iface = os.networkInterfaces()['wlan0'];

var restify = require('restify');
var v4l2Module = require('./v4l2')
var fs=require('fs');
var bodyParser = require('body-parser')
var express = require('express');

module.exports = {
	init: function() {
		//phone.on('connection', function(socket){
		//	console.log('someone connected!');
		//	socket.on('wetRequest', function (ack) {
		//		var tasks = [];
		//		console.log('on wet Request');
        //
		//		if (iface && iface[0] && iface[0]['address']) {
		//			var baseAddress = iface[0]['address'].split('.');
		//			baseAddress.pop();
		//			baseAddress = baseAddress.join('.');
        //
		//			_.forEach(['7'], function(ipLast){
		//				tasks.push(function (taskCB) {
		//					var handled = false;
		//					var req = client.get("http://"+baseAddress+'.'+ipLast, function (data, response) {
		//						// parsed response body as js object
		//						handled = true;
		//						taskCB(null, data)
		//					}).on('error', function (err) {
		//						if (!handled) {
		//							handled = true;
		//							console.log('something went wrong on the request', err.request.options);
		//							taskCB(err)
		//						}
		//					});
        //
        //
		//					req.on('requestTimeout', function (req) {
		//						if (!handled) {
		//							handled = true
		//							console.log('request has expired');
		//							req.abort();
		//							taskCB('request has expired')
		//						}
		//					});
        //
		//					req.on('responseTimeout', function (res) {
		//						if (!handled) {
		//							handled = true;
		//							console.log('response has expired');
		//							taskCB('response has expired')
		//						}
        //
		//					});
        //
        //
		//				})
		//			});
        //
		//			async.parallel(tasks, function (err, results) {
		//				if (err) {
		//					console.log(err);
		//					ack && ack(err);
		//				}
		//				else {
		//					ack && ack(null, results)
		//				}
		//			})
		//		}
		//		else {
		//			ack && ack('NanoPi Ip数据获取失败')
		//		}
        //
        //
		//	});
		//});
        //
		//io.listen(8800);
	},

	http: function () {
		var app = express();
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(express.static(__dirname + '/public'));

		app.get('/wetSensors', function (req, res) {
			var tasks = [];
			console.log('on wet Request');

			if (iface && iface[0] && iface[0]['address']) {
				var baseAddress = iface[0]['address'].split('.');
				baseAddress.pop();
				baseAddress = baseAddress.join('.');

				_.forEach(['105'], function(ip){ //Todo 下流的NanoPi的URL
					tasks.push(function (taskCB) {
						var client = restify.createJsonClient({
							url: "http://"+baseAddress+'.'+ip+':8802',
							version: '*'
						});

						client.get('/wetAndImage', function (err, req, res, obj) {
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
		const uuidPath = '/var/device_uuid';
		var bodyParserForQueryImageAndWet = require('body-parser')
		var queryImageAndWet = express();
		queryImageAndWet.use(bodyParserForQueryImageAndWet.urlencoded({ extended: false }));
		queryImageAndWet.use(bodyParserForQueryImageAndWet.json());
		queryImageAndWet.use(express.static(__dirname + '/public'));

		var uuid = null;
		async.parallel({
			uuid: function (cb) {
				fs.readFile(uuidPath, {encoding: "utf-8"}, function (err, str) {
					if (!err) {
						try {
							var obj = JSON.parse(str)['uuid'];
							cb(null, obj)
						} catch(e) {
							cb(null, null);
						}
					}
					else {
						cb(null, null);
					}
				});
			}
		}, function (err, result) {
			uuid = result['uuid'];
		});

		queryImageAndWet.get('/wetAndImage', function (req, res) {
			var baseAddress = iface[0]['address'].split('.');
			baseAddress.pop();
			baseAddress = baseAddress.join('.');

			var client = restify.createJsonClient({
				url: "http://"+baseAddress+'.7',//Todo NodeMCU的URL
				version: '*'
			});

			client.get('/', function (err, req, res, obj) {
				console.log('Server returned: %j', obj);
				var imgName = Date.parse(new Date()).toString() + '.jpg';
				var imgPath = __dirname + '/public/' + imgName;
				var imgUrl = "http://"+uuid+".frpc.zaocan84.com/"+imgName;
				process.nextTick(function () {
					// 拍照
					var lib = v4l2Module.init().lib;
					lib.L4V2Library.captureFromV4L2(imgPath);
				});
				var status = (err == null) ? 200 : 500;
				res.status(status).json({code: err == null, message: err, data: obj, img: imgUrl})
			});

		});
		queryImageAndWet.listen(8802);

	}
};