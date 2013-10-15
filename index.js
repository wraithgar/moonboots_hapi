var Moonboots = require('moonboots');
function routeConfig(contentType, clientApp, extend) {
    var config = {};
    var clientHapiConfig = clientApp.getConfig('hapi');

    if (extend && clientHapiConfig) config = clientHapiConfig;

    config.payload = {override: contentType};

    if (!clientApp.getConfig('developmentMode')) {
        config.cache = {
            expiresIn: clientApp.getConfig('cachePeriod')
        };
    }
    return config;
}

function jsHandler (clientApp) {
    return function(request) {
        clientApp.sourceCode(function _getSourceCode(source) {
            request.reply(source);
        });
    };
}

function cssHandler (clientApp) {
    return function (request) {
        request.reply(clientApp.css());
    };
}

function mainHandler(clientApp) {
      return function (request) {
        clientApp.getResult('html', function(html) {
            request.reply(html);
        });
      };
}

module.exports = {
    register: function(server, options, next) {
        var clientApp = new Moonboots(options);
        server.route({
            method: 'get',
            path: '/' + encodeURIComponent(clientApp.jsFileName()),
            handler: jsHandler(clientApp),
            config: routeConfig('text/javascript; charset=utf-8', clientApp)
        });
        server.route({
            method: 'get',
            path: '/' + encodeURIComponent(clientApp.cssFileName()),
            handler: cssHandler(clientApp),
            config: routeConfig('text/css; charset=utf-8', clientApp)
        });
        server.route({
            method: 'get',
            path: '/{client*}',
            handler: mainHandler(clientApp),
            config: routeConfig('text/javascript; charset=utf-8', clientApp, true)
        });
        next();
    }
};
