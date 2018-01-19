# node-inseptor

Inseptor helps intercept and debug HTTP and HTTPs traffic in node-based servers without the need to configure proxies, deal with SSL issues, adding exceptions to certificate pinning issues and much more.

## Usage

Inspetor is currently provided as a library. To hook a node server for inspection all you have to do is to invoke the `inseptServer` function on a node server object. The call must be preceded by a call to `startInseptServer` to initiate a server which acts as an intermediary between your node application and the front end which will help you debug the traffic. Here is an example borrowed from the demo script part of this package:

```javascript
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
```

In code which may get into production environments, we recommend to conditionally instantiate the server and hooks. For example, the following code may be adequate for your requirements:

```javascript
if (process.env.NODE_ENV !== 'production' && process.env.INSEPTOR === 'yes') {
    startInseptServer()
    inseptServer(server)
}
```

Once the server is started you can use a compatible client such as SecApps [HTTPView](https://httpview.secapps.com) to connect and debug incoming and outgoing connections. This is done via HTTPView's feeds feature.

![/docs/images/01.png]

Copy the Inseptor endpoint URL and navigate to HTTPView's Feed Settings. Enter the URL as a new feed. Ensure that the checkbox is ticked before recording.

![/docs/images/02.png]

Press the record button. You should see a connection debug in your console with the details of the connecting client. Now every request to your server will be recorded in HTTPView for inspection. You can see all the status codes, headers, message bodies, etc. You can even reply the requests and customise with the help of the built-in encoders, decoders and variables substitutions.

![/docs/images/03.png]

Refer to [SecApps](https://secapps.com) for more information.

## Purpose

The main purpose of this project is to provide simple means to debug complex node web applications and APIs with simple lightweight infrastructure which can be implemented from scratch. While this project provides reusable libraries, the tool's features can be easily implemented in a few lines of code and directly integrated as part of your project. Furthermore, the library only offers a simple message mechanism with no client tie-in. This means that alternative clients can be used. You can write your own.

## Protocol

The communication protocol is based on [pownjs](https://github.com/pownjs) tools. It is currently implemented on top of WebSockets so that it can be used by web applications. Alternative transport mechanism can be provided as well.

Messages are exchanged one way in the current version - from the server to the connected clients. We currently utilise message type 3 which is compatible with HTTPView from SecApps. Other message types will be implemented in the future which will allow streaming and pause, modify and release features.

Message type 3 has the following structure:

```
+----------+-----------------------+----------------+-----------------+
| Header   | Request Buffer Length | Request Buffer | Response Buffer |
| UInt32BE | UInt32BE              | Buffer         | Buffer          |
|          |                       |                |                 |
| 3        |                       |                |                 |
+----------+-----------------------+----------------+-----------------+
```

This message is sent to clients connected to the web socket.

## Options

The following options can be passed to `startInseptServer` function:

* logger - object imelementing the `log` method (defaults to `console`)
* sessionKey - a secret key for authentication (defaults to random key)
* port - server port (defaults to 4000)
* host - server host (defaults to 127.0.0.1)

## Contributions

Contributions are welcome. Do a pull request, open issues or get in touch on [twitter](https://twitter.com/websecurify), [facebook](https://facebook.com/websecurify/), [reddit](https://www.reddit.com/r/secapps/) or anywhere else you can get hold of our team.
