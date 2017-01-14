/**
 * Created by Tsao on 2017/1/13.
 */

var jsonfile = require('jsonfile');
var filePath = __dirname + '/manifest.json';
var deviceImplementation = require('./device_implementation');
exports = module.exports = {
  manifest: jsonfile.readFileSync(filePath, {throws: false}),
  implemtation: function (socket, propertyName, method,callback) {
     var implementation = deviceImplementation[propertyName];

    implementation && implementation[method] && implementation[method](socket, callback);
  }
};