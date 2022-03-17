#!/usr/bin/env node

let [serverHost, serverPort] = (process.argv[2] || '127.0.0.1:5333').split(':')
let [rootHost, rootPort] = (process.argv[3] || '127.0.0.1:5349').split(':')
serverPort = parseInt(serverPort || 5333)
rootPort = parseInt(rootPort || 53)

const { RecursiveServer, createDS } = require('hipr');
const middleware = require('.')

const server = new RecursiveServer({ tcp: true, edns: true, dnssec: true })
server.resolver.setStub(rootHost, rootPort, createDS())
server.use(middleware())
server.bind(serverPort, serverHost)
