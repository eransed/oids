'use strict';

// https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
const { networkInterfaces } = require('os');
export function getLocalIp(): string {
  const nets = networkInterfaces();
  const results: string[] = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results[0]
}

import { IncomingMessage } from 'http';
export function ipport(req: IncomingMessage): string {
  return req.socket.remoteAddress + ':' + req.socket.remotePort
}
