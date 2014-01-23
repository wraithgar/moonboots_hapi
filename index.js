var Moonboots = require('moonboots');
var async = require('async');

function setDefaults(options, next) {
    if (!options.appPath) {
        options.appPath = '/{client*}';
        if (!options.jsFileName) {
            options.jsFileName = 'app';
        }
        if (!options.cssFileName) {
            options.cssFileName = 'app';
        }
    }
    if (!options.jsFileName) {
        options.jsFileName = options.appPath.slice(1);
    }
    if (!options.cssFileName) {
        options.cssFileName = options.appPath.slice(1);
    }
    return options;
}

exports.register = function (plugin, options, next) {
    var HapiError = plugin.hapi.Error;
    var clientApps = (options instanceof Array) ? options : [options];

    async.forEach(clientApps, function _eachApp(options, cb) {
        var clientApp = new Moonboots(setDefaults(options));
        var extendedConfig = clientApp.getConfig('hapi') || {};
        var config = {};
        if (!clientApp.getConfig('developmentMode')) {
            config.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
            extendedConfig.cache = extendedConfig.cache || {};
            extendedConfig.cache.expiresIn = clientApp.getConfig('cachePeriod');
        }
        clientApp.on('ready', function () {
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.jsFileName()),
                handler: function _jsFileHandler(request, reply) {
                    clientApp.jsSource(function _getJsSource(err, css) {
                        if (err) {
                            return reply(new HapiError.internal('No js source'));
                        }
                        reply(css).header('content-type', 'text/javascript; charset=utf-8');
                    });
                },
                config: config
            });
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                handler: function _cssFileHandler(request, reply) {
                    clientApp.cssSource(function _getCssSource(err, css) {
                        if (err) {
                            return reply(new HapiError.internal('No css source'));
                        }
                        reply(css).header('content-type', 'text/css; charset=utf-8');
                    });
                },
                config: config
            });
            plugin.route({
                method: 'get',
                path: clientApp.getConfig('appPath'),
                handler: function _appHandler(request, reply) {
                    clientApp.getResult('html', function _getHtmlResult(err, html) {
                        if (err) {
                            return reply(new HapiError.internal('No html result'));
                        }
                        reply(html);
                    });
                },
                config: extendedConfig
            });
            cb();
        });
    }, function () {
        // expose all apps to other handlers
        plugin.helper('getMoonbootsApps', function () {
            return clientApps;
        });
        next();
    });
};
