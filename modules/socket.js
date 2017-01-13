const SocketConst = {
	Type: {
		Broadcast: "_Broadcast"
	},
	EventName: {
		Update: "Update"
	}
}
module.exports = {
	const: SocketConst,
	init: function(eventEmitter) {
		var io = require('socket.io')();
		io.on('connection', function(socket){
			console.log('new client coming')
		});

		setInterval(function(){
			eventEmitter.emit(SocketConst.Type.Broadcast, 'switch', {status: true});
		},3000);

		// 监听广播，并且向外发送
		eventEmitter.on(SocketConst.Type.Broadcast, io.emit);
		io.listen(8800);
	}
}