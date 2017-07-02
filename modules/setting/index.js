var QR=require('qrcode-js');
var fs=require('fs');
var async=require('async');
var bodyParser = require('body-parser')

// Wifi SSID, PWD配置页面的Express程序
const uuidPath = '/var/device_uuid';
const wifiConfigPath = '/etc/wpa_supplicant/wpa_supplicant.conf';
module.exports = function () {
    var express = require('express');
    var app = express();
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());

    app.post('/', function (req, res) {
        var ssid = req.body.ssid;
        var password = req.body.password;

        // 检查参数
        if (!ssid || !password) {
            res.json({message: '参数错误'});
            return;
        }

        async.waterfall([
            function (cb) {
                fs.readFile(wifiConfigPath, {encoding: "utf-8"}, function (err, str) {
                    if (err) {
                        cb(err)
                    }
                    else {
                        cb(null, str)
                    }
                })
            },

            function (wifiConfigString, cb) {
                wifiConfigString = wifiConfigString.replace(/ssid=".*"/, 'ssid="'+ ssid +'"')
                wifiConfigString = wifiConfigString.replace(/psk=".*"/, 'psk="'+ password +'"')

                cb(null, wifiConfigString)
            },
            function (finalWifiConfig, cb) {
                fs.writeFile(wifiConfigPath, finalWifiConfig, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, "SUCCESS")
                    }
                })
            }
        ], function (err, result) {
            if (err) {
                res.json({message: '保存失败,请查看错误原因'});
            }
            else {
                res.json({message:'修改成功,请切换Wifi模式让设备联网'});
            }
        });
        
    });

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
                        cb(null, null);
                    }
                });
            },
            wifiConfig: function (cb) {
                fs.readFile(wifiConfigPath, {encoding: "utf-8"}, function (err, str) {
                    var config = {ssid: "", password: ""};
                    if (!err) {
                        try {
                            config['ssid'] = str.match("ssid=\"(.*)\"")[1];
                            config['password'] = str.match("psk=\"(.*)\"")[1];
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