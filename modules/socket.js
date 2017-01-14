const properties = require('./properties/index');
const SocketConst = {
	Type: {
		Broadcast: "Broadcast"
	},
	EventName: {
		Update: "Update"
	}
};
module.exports = {
	const: SocketConst,
	init: function(eventEmitter) {
		var io = require('socket.io')();
		io.on('connection', function(socket){
			console.log('new client coming');
			socket.on('subscribe', function (propertyName, fn) {
				properties(propertyName, function (updatedValue) {
					fn && fn(updatedValue);
				})
			});
		});

		// 监听广播，并且向外发送
		eventEmitter.on(SocketConst.Type.Broadcast, function(eventName, data){
			io.emit(eventName, data);
		});
		io.listen(8800);
	}
}