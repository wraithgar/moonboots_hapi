var Moonboots = require('moonboots');
function routeConfig(clientApp, extend) {
    var config = {};
    var clientHapiConfig = clientApp.getConfig('hapi');

    if (extend && clientHapiConfig) config = clientHapiConfig;

    if (!clientApp.getConfig('developmentMode')) {
        config.cache = {
            expiresIn: clientApp.getConfig('cachePeriod')
        };
    }
    return config;
}

function jsHandler(clientApp) {
    return function (request) {
        clientApp.jsSource(function _getJsSource(err, js) {
            request.reply(err || js).header('content-type', 'text/javascript; charset=utf-8');
        });
    };
}

function cssHandler(clientApp) {
    return function (request) {
        clientApp.cssSource(function _getCssSource(err, css) {
            request.reply(err || css).header('content-type', 'text/css; charset=utf-8');
        });
    };
}

function mainHandler(clientApp) {
    return function (request) {
        clientApp.getResult('html', function (err, html) {
            request.reply(err || html);
        });
    };
}

module.exports = {
    register: function (server, options, next) {
        var clientApp = new Moonboots(options);
        server.route({
            method: 'get',
            path: '/' + encodeURIComponent(clientApp.jsFileName()),
            handler: jsHandler(clientApp),
            config: routeConfig(clientApp)
        });
        server.route({
            method: 'get',
            path: '/' + encodeURIComponent(clientApp.cssFileName()),
            handler: cssHandler(clientApp),
            config: routeConfig(clientApp)
        });
        server.route({
            method: 'get',
            path: clientApp.getConfig('appPath') || '/{client*}',
            handler: mainHandler(clientApp),
            config: routeConfig(clientApp, true)
        });
        next();
    }
};
