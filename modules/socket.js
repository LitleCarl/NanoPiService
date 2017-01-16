const propertiesIMP = require('./properties/index')['implementation'];
const propertiesManifest = require('./properties/index')['manifest'];
const SocketConst = {
	Type: {
		Broadcast: "Broadcast"
	},
	EmitEventName: {
		SubscribeRes: "subscribe_res"
	},
    OnEventName: {
        DeviceInfo: "device_info"
    }
};
module.exports = {
	const: SocketConst,
	init: function() {
		var io = require('socket.io')();
		io.on('connection', function(socket){
			console.log('new client coming');

            socket.on(SocketConst.OnEventName.DeviceInfo, function (ack) {
                console.log('Receive req for device_info, ready to ack, ', ack);
               ack && ack(propertiesManifest);
            });

            socket.on('subscribe', function (propertyName) {
				propertiesIMP(socket, propertyName, 'subscribe', function (updatedValue) {
					socket.emit(SocketConst.EmitEventName.SubscribeRes, {name: propertyName, value: updatedValue});
				})
			});
		});

		io.listen(8800);
	}
};