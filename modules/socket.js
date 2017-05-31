const propertiesIMP = require('./properties/index')['implementation'];
const propertiesManifest = require('./properties/index')['manifest'];
const _ = require('lodash');
const async = require('async')
var Client = require('node-rest-client').Client;
var client = new Client();

// 获取IP地址
var os=require('os');
var iface = os.networkInterfaces()['wlan0'];

module.exports = {
	init: function() {
		const _ = require('lodash');
		const async = require('async')
		var Client = require('node-rest-client').Client;
		var client = new Client();
		var io = require('socket.io')();
		var phone = io.of('/phone');


		phone.on('connection', function(socket){
			console.log('someone connected!');
			socket.on('wetRequest', function (ack) {
				var tasks = [];
				console.log('on wet Request');

				if (iface && iface[0] && iface[0]['address']) {
					var baseAddress = iface[0]['address'].split('.');
					baseAddress.pop();
					baseAddress = baseAddress.join('.');

					_.forEach(['7'], function(ipLast){
						tasks.push(function (taskCB) {
							var handled = false;
							client.get("http://"+baseAddress+'.'+ipLast, function (data, response) {
								// parsed response body as js object
								handled = true;
								taskCB(null, data)
							}).on('error', function (err) {
								if (!handled) {
									handled = true;
									console.log('something went wrong on the request', err.request.options);
									taskCB(err)
								}
							});


							req.on('requestTimeout', function (req) {
								if (!handled) {
									handled = true
									console.log('request has expired');
									req.abort();
									taskCB('request has expired')
								}
							});

							req.on('responseTimeout', function (res) {
								if (!handled) {
									handled = true;
									console.log('response has expired');
									taskCB('response has expired')
								}

							});


						})
					});

					async.parallel(tasks, function (err, results) {
						if (err) {
							console.log(err);
							ack && ack(err);
						}
						else {
							ack && ack(null, results)
						}
					})
				}
				else {
					ack && ack('NanoPi Ip数据获取失败')
				}


			});
		});

		io.listen(8800);
	}
};