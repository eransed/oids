"use strict";
exports.__esModule = true;
var ws_1 = require("ws");
var net_1 = require("./net");
// import {version, name} from './package.json';
// const name_ver: string = name + ' ' + version
var pack = require('./package.json');
var name_ver = pack.name + ' ' + pack.version;
var PORT = 5000;
var server = new ws_1.WebSocketServer({
    port: PORT
});
var clients = [];
function addNewClientIfNotExisting(clients, clientConnection) {
    for (var _i = 0, clients_1 = clients; _i < clients_1.length; _i++) {
        var c = clients_1[_i];
        if (c === clientConnection) {
            return false;
        }
    }
    clients.push(clientConnection);
}
// object is any non-primitive object ie not string, number, boolean, undefined, null etc. added in typescript 2.2
var broadcastToClients = function (skipSourceClient, connectedClients, data) {
    for (var _i = 0, connectedClients_1 = connectedClients; _i < connectedClients_1.length; _i++) {
        var client = connectedClients_1[_i];
        if (skipSourceClient !== client) {
            client.send(JSON.stringify(data));
        }
    }
};
server.on('connection', function connection(clientConnection, req) {
    if (addNewClientIfNotExisting(clients, clientConnection)) {
        console.log('Added new client ' + req.socket.remoteAddress);
    }
    clientConnection.addEventListener('message', function (event) {
        broadcastToClients(clientConnection, clients, JSON.parse(event.data));
    });
});
console.log('Starting ' + name_ver + ', listening on ws://' + (0, net_1.getLocalIp)() + ':' + PORT);
