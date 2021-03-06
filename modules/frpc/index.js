const uuidV1 = require('uuid/v1');
const fs = require('fs');
const filePath = '/var/device_uuid';
const frpcConfigPath = '/var/frpc.ini';

var frpcConfigTemplate = 
`# [common] is integral section
[common]
server_addr = api.zaocan84.com
server_port = 7000
auth_token = 58133240
privilege_token = 12345678

[web02]
type = http
privilege_mode = true
local_port = 8800
subdomain = dev

[video0]
type = http
privilege_mode = true
local_port = 8080
subdomain = video0SubDomain
`

module.exports = function(){
	fs.readFile(filePath, {encoding: "utf-8"}, function(err, contentStr){
		var uuid = contentStr;
		if (err) {
			uuid = uuidV1();
			// 写入uuid
			fs.writeFileSync(filePath, JSON.stringify({"uuid": uuid}), {encoding: "utf-8"});
		}

		fs.readFile(frpcConfigPath, {encoding: "utf-8"}, function(err, contentStr){
			if (err) {
				// 写入fprc.ini配置
				var frpcConfig = frpcConfigTemplate.replace("web02", uuid + "-web02");
				frpcConfig = frpcConfigTemplate.replace("video0", uuid + "-video0");
				frpcConfig = frpcConfig.replace("subdomain = dev", "subdomain = " + uuid + "-web02");
				frpcConfig = frpcConfig.replace("subdomain = video0SubDomain", "subdomain = " + uuid + "-video0");
				fs.writeFileSync(frpcConfigPath, frpcConfig, {encoding: "utf-8"});
			}

			(function spawnFrpcProcess(){
				var util  = require('util'), spawn = require('child_process').spawn,
			    command    = spawn('sudo', [__dirname+'/frpc', '-c', frpcConfigPath, '--log-level', 'debug']); // the second arg is the command 

				command.stdout.on('data', function (data) {    // register one or more handlers
				  //console.log(data+"");
				});

				command.stderr.on('data', function (data) {
				  //console.log("err:"+data);
				});

				command.on('exit', function (code) {
					//console.log('frpc exit with code:', code);
					spawnFrpcProcess();
				});
			})();

			

		});
	})	
}

