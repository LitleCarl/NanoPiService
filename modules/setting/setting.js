var QR=require('qrcode-js');
var fs=require('fs');
var async=require('async');

// Wifi SSID, PWD配置页面的Express程序
const uuidPath = '/var/device_uuid';
const wifiConfigPath = '/etc/wpa_supplicant/wpa_supplicant.conf';
module.exports = function () {
    var express = require('express');
    var app = express();
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');

    app.get('/', function (req, res) {
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
                        cb(null, "aass");
                    }
                });
            },
            wifiConfig: function (cb) {
                fs.readFile(wifiConfigPath, {encoding: "utf-8"}, function (err, str) {
                    var config = {ssid: "", password: ""};
                    if (!err) {
                        try {
                            config['ssid'] = str.match("ssid=\"(.*)\"");
                            config['password'] = str.match("psk=\"(.*)\"");
                            cb(null, config);
                        } catch(e) {
                            cb(null, {});
                        }
                    }
                    else {
                        cb(null, {});
                    }
                });
            }
        }, function (err, result) {
            var uuid = result['uuid'];

            var local = {wifiConfig: result['wifiConfig']};

            if (uuid) {
                local.qrcode = QR.toBase64(uuid, 4);
            }

            res.render('index', local);
        })

    });

    app.use(express.static(__dirname + '/public'));

    app.listen(3000);
};