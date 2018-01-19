const http = require('http')
const { startInseptServer, inseptServer } = require('../lib/index')

const server = http.createServer((request, response) => {
    response.end('Hello Node.js Server!')
})

server.listen(process.env.PORT || 3000, (err) => {
    if (err) {
        console.err(err)
    } else {
        console.log(`server listening on ${process.env.PORT || 3000}`)

        startInseptServer()
        inseptServer(server)
    }
})
