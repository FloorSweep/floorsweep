var proxy = require('express-http-proxy');
var express = require("express");
var cors = require("cors");
var app = express();
var PORT = process.env.PORT || 8089;
app.use(cors({credentials: true, origin: true}));

function determineProxyDestinationHost(request) {
    const host = request.headers['x-api-proxy-dst-host'];
    if (!host) {
        throw new Error("To use local api-proxy, requests must have HTTP headers 'x-api-proxy-dst-host' present");
    }
    console.debug("Proxying request to host: ", host);
    return host;
}

app.use('/', proxy(determineProxyDestinationHost, {
    https: false,
    userResHeaderDecorator: function (
        headers,
        userReq,
        userRes,
        proxyReq,
        proxyRes
    ) {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'POST, GET, PATCH,PUT,DELETE,  OPTIONS';
        return headers;
    },
}));

app.listen(PORT);
