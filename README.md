# moonboots_hapi

Moonboots plugin that allows it to serve files using a hapi server.

## How to use:

Exactly like you would expect, except it's a plugin now (which means it
registers the catchall route itself).  Also you don't pass in a server
parameter.

```js
var Hapi = require('hapi');

var moonboots_config = {
    main: __dirname + '/sample/app/app.js',
    developmentMode: false,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/styles.css'
    ],
};

var server = new Hapi.Server();

server.pack.require({moonboots_hapi: moonboots_config}, function (err) {
    server.start();
});
