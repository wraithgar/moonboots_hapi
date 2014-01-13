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
    ]
};

var server = new Hapi.Server();

server.pack.require({moonboots_hapi: moonboots_config}, function (er) {
    server.start();
});
```


## Additional options

If your app has something like auth you can pass in a hapi parameter to
the moonboots config and it will be added to the _config_ portion of the
client app request handler

The app by default will serve on all requests unless you pass in an
_appPath_ option

```js
var Hapi = require('hapi');
var HapiSession = require('hapi-session');

var moonboots_config = {
    main: __dirname + '/sample/app/app.js',
    developmentMode: false,
    libraries: [
        __dirname + '/sample/libraries/jquery.js'
    ],
    stylesheets: [
        __dirname + '/styles.css'
    ],
    hapi: {
        auth: 'session',
    },
    appPath: '/app'
};

var server = new Hapi.Server();
server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {
        reply().redirect('/app');
    }
});
server.auth('session', {
    implementation: new HapiSession(server, session_options)
});

server.pack.require({moonboots_hapi: moonboots_config}, function (err) {
    server.start();
});
```

## Test

For now, run sample.js and make sure you have a grey (#ccc) background and the
"Woo! View source to see what rendered me" message in your window.

#License

MIT
