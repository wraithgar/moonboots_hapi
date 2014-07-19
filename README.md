# moonboots-hapi
====

[![NPM](https://nodei.co/npm/moonboots_hapi.png)](https://nodei.co/npm/moonboots_hapi/)

Moonboots plugin that allows it to serve files using a hapi server.
Be sure to use at least hapi 2.0 (won't work on 1.0, see legacy branch for 1.0)

## How to use:

Exactly like moonboots, but with routing info.  The moonboots-specific
config is put in a `moonboots` subconfig.  Also there is no longer any
need to pass in a server parameter.

```js
var Hapi = require('hapi');

var config = {
    appPath: '/myapp/{clientPath*}',
    moonboots: {
        main: __dirname + '/sample/app/app.js',
        developmentMode: false,
        libraries: [
            __dirname + '/sample/libraries/jquery.js'
        ],
        stylesheets: [
            __dirname + '/styles.css'
        ]
    }
};

var server = new Hapi.Server();

server.pack.require({moonboots_hapi: config}, function (er) {
    server.start();
});
```

## Additional options

You can disable specific routes (all are enabled by default) using the
`routes` config

This example would tell moonboots-hapi not to add the route for the html
app to hapi.  You can do the same with `js` for the js route and `css`
for the css route.

```js
var options = {
    routes: {html: false}
};


You can specify labels for your your routes, simply pass them in as a
config item (see Hapi documentation for plugin.select for more
information on labels)

```js
var options = {
    appPath = '/app',
    labels: ['foo'],
    moonboots: {/* ... */}
};
```

You can also configure each of the three routes (app, js, and css) as
much you want. Simply pass in anything that would go in the `config` of
a Hapi route for that particular route.

```js
var config = {
    appPath: '/app',
    appConfig: {
        //Anything here will go into the config for the app route
    },
    jsConfig: {
        //Anything here will go into the config for the js route
    },
    cssConfig: {
        //Anything here will go into the config for the css route
    },
    moonboots: {/* moonboots config*/}
};
```

The app by default will serve on all requests unless you pass in an
_appPath_ option

js and css paths will default to _appPath_ if it is defined, and will
default to _app.js_ and _app.css_ respectively otherwise.

```js
var Hapi = require('hapi');
var HapiSession = require('hapi-session');

var config = {
    appPath: '/app',
    appConfig: {
        auth: 'session',
    }
    moonboots: {
        main: __dirname + '/sample/app/app.js',
        developmentMode: false,
        libraries: [
            __dirname + '/sample/libraries/jquery.js'
        ],
        stylesheets: [
            __dirname + '/styles.css'
        ]
    }
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

server.pack.require({moonboots_hapi: config}, function (err) {
    server.start();
});
```


## Templated app

By default moonboots serves up an app html of just a script and css tag
linking to the js and css source. You can override this by passing an
``appTemplate`` option.  This string will be passed to the view handler
in hapi, and given the following context:

```
{
    jsFileName: '/link/to/app.js',
    cssFileName: '/link/to/app.css'
}
```

## Multiple mooonboots on one server

You can register multiple moonboots apps for a single hapi server like
so:

1. Pass in an array of moonboots configs instead of a single config.
2. Make sure that each config provides unique `appPath` or hapi will
   complain that the paths conflict.

Example of registering multiple apps:

```js
server.pack.require({moonboots_hapi: [moonboots_config1, moonboots_config2]}, function (er) {
    server.start();
});
```

## Helpers

There are currently two methods exposed from the plugin

```js
server.plugins['moonboots_hapi'].clientConfig(0, function (config) {
    console.log(config); //Will be the first client config
});
server.plugins['moonboots_hapi'].clientApp(0, function (clientApp) {
    console.log(clientApp); //Will be the first moonboots app
});
```

## Test

Run `npm test`

## Sample

Run `npm start` and make sure you have a grey (#ccc) background and the
"Woo! View source to see what rendered me" message in your window.

#License

MIT
