"use strict";
exports.__esModule = true;
var ws_1 = require("ws");
var pub_config_1 = require("./pub_config");
var net_1 = require("./net");
var pack = require('../package.json');
var name_ver = pack.name + ' ' + pack.version;
var WS_PORT = pub_config_1.OIDS_WS_PORT;
var server = new ws_1.WebSocketServer({
    port: WS_PORT
});
var globalConnectedClients = [];
var Client = (function () {
    function Client(_ws, _req, _name, _dateAdded) {
        this.nameHasBeenUpdated = false;
        this.ws = _ws;
        this.req = _req;
        this.name = _name;
        this.dateAdded = _dateAdded;
        this.addEventListeners();
    }
    Client.prototype.updateNameOnce = function (newName) {
        if (!this.nameHasBeenUpdated) {
            var oldName = this.name;
            this.name = newName;
            this.nameHasBeenUpdated = true;
            console.log("Updated name: ".concat(oldName, " -> ").concat(this.name));
        }
        else {
            console.error("Multiple name updates for ".concat(this.toString(), ": newName=\"").concat(newName, "\""));
        }
    };
    Client.prototype.addEventListeners = function () {
        var _this = this;
        this.ws.addEventListener('close', function () {
            console.log("".concat(_this.toString(), " has been disconnected, sending goodbye message"));
            var offlineMessage = _this.lastDataObject;
            try {
                offlineMessage.online = false;
            }
            catch (err) {
                console.error(err);
            }
            broadcastToClients(_this, globalConnectedClients, offlineMessage);
            globalConnectedClients = removeDisconnectedClients(globalConnectedClients);
            if (globalConnectedClients.length === 0) {
                console.log('No clients connected :(');
            }
        });
        this.ws.addEventListener('message', function (event) {
            var o = JSON.parse(event.data);
            _this.lastDataObject = o;
            if (!_this.nameHasBeenUpdated) {
                globalConnectedClients.forEach(function (c) {
                    if (c === _this && c.name === _this.name) {
                        c.updateNameOnce(o.name);
                    }
                });
            }
            o.online = true;
            broadcastToClients(_this, globalConnectedClients, o);
        });
    };
    Client.prototype.toString = function () {
        return "".concat(this.name, " (").concat((0, net_1.ipport)(this.req), ", ").concat(getReadyStateText(this.ws), ", added: ").concat(this.dateAdded.toLocaleTimeString(), ")");
    };
    return Client;
}());
function getReadyStateText(ws) {
    var s = ws.readyState;
    switch (s) {
        case ws_1.CONNECTING:
            return 'CONNECTING';
        case ws_1.CLOSED:
            return 'CLOSED';
        case ws_1.OPEN:
            return 'OPEN';
        case ws_1.CLOSING:
            return 'CLOSING';
        default:
            return 'UNKNOWN (' + s + ')';
    }
}
function addNewClientIfNotExisting(clients, clientConnection) {
    for (var _i = 0, clients_1 = clients; _i < clients_1.length; _i++) {
        var c = clients_1[_i];
        if (c === clientConnection && c.name === clientConnection.name) {
            return false;
        }
    }
    clients.push(clientConnection);
    return true;
}
function removeClientIfExisting(clients, clientConnection) {
    var lengthBefore = clients.length;
    clients = clients.filter(function (c) {
        return c === clientConnection;
    });
    var removedCount = lengthBefore - clients.length;
    if (removedCount === 1) {
        console.log("Removed client: ".concat(clientConnection.toString()));
    }
    else if (removedCount > 1) {
        console.error("Removed ".concat(removedCount, " equal clients in list"));
    }
    return clients;
}
function removeDisconnectedClients(clients) {
    var disconnectedClients = clients.filter(function (c) {
        return c.ws.readyState === ws_1.CLOSED || c.ws.readyState === ws_1.CLOSING;
    });
    var connectedClients = clients.filter(function (c) {
        return c.ws.readyState === ws_1.OPEN || c.ws.readyState === ws_1.CONNECTING;
    });
    disconnectedClients.forEach(function (c) {
        console.log("Disconnected: ".concat(c.toString()));
    });
    connectedClients.forEach(function (c) {
        console.log("Connected: ".concat(c.toString()));
    });
    return connectedClients;
}
function broadcastToClients(skipSourceClient, connectedClients, data) {
    for (var _i = 0, connectedClients_1 = connectedClients; _i < connectedClients_1.length; _i++) {
        var client = connectedClients_1[_i];
        if (skipSourceClient !== client && skipSourceClient.name !== client.name) {
            client.ws.send(JSON.stringify(data));
        }
    }
}
server.on('connection', function connection(clientConnection, req) {
    clientConnection.send(JSON.stringify({ serverVersion: name_ver }));
    globalConnectedClients = removeDisconnectedClients(globalConnectedClients);
    var newClient = new Client(clientConnection, req, "Client-".concat(globalConnectedClients.length), new Date());
    if (addNewClientIfNotExisting(globalConnectedClients, newClient)) {
        console.log("Storing new client ".concat(newClient.toString(), " in broadcast list"));
    }
    console.log("".concat(globalConnectedClients.length, " connected clients:"));
    globalConnectedClients.forEach(function (c) {
        console.log("   ".concat(c.toString()));
    });
});
console.log("Starting ".concat(name_ver));
console.log("Listening on ws://localhost:".concat(WS_PORT, " and ws://").concat((0, net_1.getLocalIp)(), ":").concat(WS_PORT, "\n"));
