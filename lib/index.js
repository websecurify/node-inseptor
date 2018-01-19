const ws = require('ws')
const url = require('url')
const crypto = require('crypto')

let wsServer

const startInseptServer = (options) => {
    options = options || {}

    const logger = options.logger || console
    const sessionKey = options.sessionKey || crypto.randomBytes(20).toString('hex')

    wsServer = new ws.Server(Object.assign({port: 4000, host: '127.0.0.1'}, options))

    wsServer.on('listening', () => {
        const address = wsServer._server.address()

        logger.log(`web socket listening on ${address.address}:${address.port}`)
        logger.log(`web socket url ws://${address.address}:${address.port}/${sessionKey}`)
    })

    wsServer.on('connection', (client, req) => {
        const remoteAddress = client._socket.remoteAddress
        const remotePort = client._socket.remotePort

        if (url.parse(req.url, true).pathname !== `/${sessionKey}`) {
            client._socket.destroy() // TODO: better way to do this

            logger.log(`web socket client denied from ${remoteAddress}:${remotePort}`)
        } else {
            logger.log(`web socket client connected from ${remoteAddress}:${remotePort}`)
        }
    })
}

const pushType3 = (requestBuf, responseBuf) => {
    if (!wsServer) {
        return
    }

    const headerBuf = Buffer.alloc(4 + 4)

    headerBuf.writeUInt32BE(3, 0)
    headerBuf.writeUInt32BE(requestBuf.byteLength, 4)

    const message = Buffer.concat([headerBuf, requestBuf, responseBuf])

    wsServer.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(message)
        }
    })
}

const inseptServer = (server) => {
    server._events.connection = (function (connection) {
        return function (socket) {
            const requestChunks = []
            const responseChunks = []

            socket.write = (function (write) {
                return function (data, encoding, callback) {
                    if (data) {
                        responseChunks.push(Buffer.from(data))
                    }

                    write.call(this, data, encoding, callback)
                }
            })(socket.write)

            socket.end = (function (end) {
                return function (data, encoding) {
                    if (data) {
                        responseChunks.push(Buffer.from(data))
                    }

                    end.call(this, data, encoding)
                }
            })(socket.end)

            connection.call(this, socket)

            socket.on('data', function (data) {
                if (data) {
                    requestChunks.push(Buffer.from(data))
                }
            })

            socket.on('end', function (data) {
                if (data) {
                    requestChunks.push(Buffer.from(data))
                }

                pushType3(Buffer.concat(requestChunks), Buffer.concat(responseChunks))
            })
        }
    })(server._events.connection)
}

exports.startInseptServer = startInseptServer
exports.inseptServer = inseptServer
