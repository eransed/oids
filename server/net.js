'use strict';
exports.__esModule = true;
exports.getLocalIp = void 0;
// import { networkInterfaces } from 'os';
var networkInterfaces = require('os').networkInterfaces;
// import { networkInterfaces } = 
function getLocalIp() {
    var nets = networkInterfaces();
    // const results = Object.create(null); // Or just '{}', an empty object
    var results = [];
    for (var _i = 0, _a = Object.keys(nets); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        for (var _b = 0, _c = nets[name_1]; _b < _c.length; _b++) {
            var net = _c[_b];
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            var familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name_1]) {
                    // results[name] = [];
                }
                // results[name].push(net.address);
                results.push(net.address);
            }
        }
    }
    // console.log(results)
    return results[0];
}
exports.getLocalIp = getLocalIp;
