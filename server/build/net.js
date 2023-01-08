'use strict';
exports.__esModule = true;
exports.ipport = exports.getLocalIp = void 0;
var networkInterfaces = require('os').networkInterfaces;
function getLocalIp() {
    var nets = networkInterfaces();
    var results = [];
    for (var _i = 0, _a = Object.keys(nets); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        for (var _b = 0, _c = nets[name_1]; _b < _c.length; _b++) {
            var net = _c[_b];
            var familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results[0];
}
exports.getLocalIp = getLocalIp;
function ipport(req) {
    return req.socket.remoteAddress + ':' + req.socket.remotePort;
}
exports.ipport = ipport;
