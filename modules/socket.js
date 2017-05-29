const propertiesIMP = require('./properties/index')['implementation'];
const propertiesManifest = require('./properties/index')['manifest'];
const _ = require('lodash');
const async = require('async')
var Client = require('node-rest-client').Client;

const SocketConst = {
	Type: {
		Broadcast: "Broadcast"
	},
	EmitEventName: {
		SubscribeRes: "subscribe_res"
	},
    OnEventName: {
        DeviceInfo: "device_info"
    },

};
module.exports = {
	const: SocketConst,
	init: function() {
		var io = require('socket.io')({"transports": ['websocket']});
		var webSensor = io.of('/wetSensor');
		var phone = io.of('/phone');
		webSensor.on('connection', function(socket){
			console.log('new client coming');

		});

		phone.on('connection', function(socket){
			socket.on('wetRequest', function (ack) {
				var clients = webSensor.connected;
				var tasks = [];

				_.forEach(['192.168.31.140'], function(ip){
					if (clients[key] && clients[key]['id']) {
						tasks.push(function (taskCB) {
							//TODO 可能需要设置超时时间

							var client = new Client();
							client.get("http://"+ip, function (data, response) {
								// parsed response body as js object
								console.log('传感器的数据', data)
								taskCB(null, data)
							});
						})
					}
				});

				async.parallel(tasks, function (err, results) {
					if (err) {
						console.log(err)
					}
					else {
						ack && ack(results)
					}
				})
			});
		});

		io.listen(8800);
	}
};