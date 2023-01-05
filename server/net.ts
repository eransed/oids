'use strict';

import { IncomingMessage } from "http";

// import { networkInterfaces } from 'os';
const { networkInterfaces } = require('os');

export function getLocalIp(): string {

  const nets = networkInterfaces();
  const results: string[] = []

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        if (!results[name]) {
          // results[name] = [];
        }
        // results[name].push(net.address);
        results.push(net.address);
      }
    }
  }
  // console.log(results)
  return results[0]
}

export function ipport(req: IncomingMessage): string {
  return req.socket.remoteAddress + ':' + req.socket.remotePort
}
