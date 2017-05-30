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
		var phone = io.of('/phone');


		phone.on('connection', function(socket){
			console.log('someone connected!')
			socket.on('wetRequest', function (ack) {
				var tasks = [];
				console.log('on wet Request')
				_.forEach(['192.168.31.140'], function(ip){
					tasks.push(function (taskCB) {
						//TODO 可能需要设置超时时间

						var client = new Client();
						client.get("http://"+ip, function (data, response) {
							// parsed response body as js object
							console.log('传感器的数据', data)
							taskCB(null, data)
						});
					})
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